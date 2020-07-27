import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import {
  ApolloError,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express';
import { v4 as uuid } from 'uuid';

import { nodeCache } from '../nodeCache';

import { User } from '../entity/User';

import { sendMail } from '../mails/sendMail';

import { UserResponse } from '../graphqlTypes/UserResponse';
import { SuccessResponse } from '../graphqlTypes/SuccessResponse';

import { Context } from '../types';

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async signUp(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<SuccessResponse> {
    try {
      const existingUser = await User.find({
        where: [{ username }, { email }],
      });

      if (existingUser.length) {
        throw new UserInputError('Invalid Email/Password', {
          email: 'email already taken',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const emailToken = uuid();

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      }).save();

      // expire in 900 seconds = 15 Minutes
      nodeCache.set(emailToken, user.id, 900);

      const mail = {
        email: user.email,
        subject: 'Welcome to Corperation',
        templateFilename: 'confirmAccount',
      };

      const contextData = {
        host: `${process.env.BACKEND}/confirmAccount/${emailToken}`,
      };

      try {
        await sendMail(mail, contextData);
        return { success: true };
      } catch (error) {
        throw new ApolloError(
          `Someting went wrong while sending an email. Error: ${error.message}`
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => UserResponse)
  async logIn(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    try {
      const [user] = await User.find({
        where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (!user) {
        throw new UserInputError('Invalid Email/Password');
      }

      if (!user.verified) {
        throw new AuthenticationError('User not verified');
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new UserInputError('Invalid Email/Password');
      }

      const authToken = uuid();

      nodeCache.set(user.username, authToken, 60 * 60 * 24);

      const authTokenSigned = jwt.sign(
        { authToken, username: user.username },
        secret,
        {
          expiresIn: '24h',
        }
      );
      const refreshTokenSigned = jwt.sign({ username: user.username }, secret, {
        expiresIn: '722h',
      });

      const refreshTokenDate = new Date();
      refreshTokenDate.setHours(refreshTokenDate.getHours() + 720);

      ctx.res.cookie('refresh_token', refreshTokenSigned, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: refreshTokenDate,
        path: '/refreshToken',
        sameSite: true,
      });

      return {
        user: {
          username: user.username,
          email: user.email,
          authToken: authTokenSigned,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => SuccessResponse)
  async logOut(@Ctx() ctx: Context) {
    ctx.res.clearCookie('refresh_token', { path: '/refreshToken' });

    return { success: true };
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(
    @Arg('username') username: string,
    @Arg('email') email: string
  ): Promise<SuccessResponse> {
    try {
      const user = await User.findOne({ email, username });
      if (!user) {
        throw new UserInputError('User not found');
      }

      const resetPasswordToken = uuid();
      nodeCache.set(resetPasswordToken, user.id, 900);

      const mail = {
        email: user.email,
        subject: 'Reset Password',
        templateFilename: 'resetPassword',
      };

      const contextData = {
        host: `${process.env.BACKEND}/resetPassword/${resetPasswordToken}`,
      };

      await sendMail(mail, contextData);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
