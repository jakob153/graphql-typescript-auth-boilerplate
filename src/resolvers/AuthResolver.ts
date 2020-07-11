import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import {
  ApolloError,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express';
import { v4 as uuid } from 'uuid';

import { sendMail } from '../mails/sendMail';
import { User } from '../entity/User';

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
  ) {
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
        emailToken,
      }).save();

      const mail = {
        email: user.email,
        subject: 'Welcome to Corperation',
        templateFilename: 'confirmAccount',
      };

      const contextData = {
        host: `${process.env.REST_API}/rest/confirmAccount?emailToken=${emailToken}`,
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
  ) {
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
      const refreshToken = uuid();

      user.refreshToken = refreshToken;
      user.save();

      const authTokenSigned = jwt.sign({ authToken }, secret, {
        expiresIn: '1d',
      });
      const refreshTokenSigned = jwt.sign({ refreshToken }, secret, {
        expiresIn: '722h',
      });

      user.authToken = authTokenSigned;

      const refreshTokenDate = new Date();
      refreshTokenDate.setHours(refreshTokenDate.getHours() + 720);

      ctx.res.cookie('refresh_token', refreshTokenSigned, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: refreshTokenDate,
        path: '/rest/refreshToken',
        sameSite: process.env.NODE_ENV === 'production' && 'none',
      });

      return { user };
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
  ) {
    try {
      const user = await User.findOne({ email, username });

      if (!user) {
        throw new UserInputError('User not found');
      }

      const emailToken = jwt.sign({ emailToken: user.emailToken }, secret, {
        expiresIn: '15m',
      });

      const mail = {
        email: user.email,
        subject: 'Reset Password',
        templateFilename: 'resetPassword',
      };

      const contextData = {
        host: `${process.env.REST_API}/rest/resetPassword/${emailToken}/${user.id}`,
      };

      await sendMail(mail, contextData);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
