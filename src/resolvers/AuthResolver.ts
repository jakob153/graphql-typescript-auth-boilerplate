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

import { AuthInput } from '../graphqlTypes/AuthInput';
import { UserResponse } from '../graphqlTypes/UserResponse';
import { SuccessResponse } from '../graphqlTypes/SuccessResponse';

import { Context, DecodedEmailToken } from '../types';

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async signUp(
    @Arg('input')
    { email, password }: AuthInput
  ) {
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new UserInputError('Invalid Email/Password', {
          email: 'email already taken',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const emailToken = uuid();

      const user = await User.create({
        email,
        password: hashedPassword,
        emailToken,
      }).save();

      const emailTokenSigned = jwt.sign({ emailToken }, secret, {
        expiresIn: '15m',
      });

      const mail = {
        email: user.email,
        subject: 'Welcome to Blacklist',
        templateFilename: 'confirmAccount',
      };

      const contextData = {
        host: `${process.env.SERVER}/confirmAccount?emailToken=${emailTokenSigned}`,
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
      console.error(error);
      throw new AuthenticationError('Someting went wrong');
    }
  }

  @Mutation(() => UserResponse)
  async logIn(
    @Arg('input') { email, password }: AuthInput,
    @Ctx() ctx: Context
  ) {
    try {
      const user = await User.findOne({ email });

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

      user.refreshToken = uuid();
      user.save();

      const authTokenSigned = jwt.sign({ userId: user.id }, secret, {
        expiresIn: '170h',
      });
      const refreshTokenSigned = jwt.sign(
        { refreshToken: user.refreshToken },
        secret,
        {
          expiresIn: '722h',
        }
      );

      const authTokenDate = new Date();
      const refreshTokenDate = new Date();

      ctx.res.cookie('auth_token', authTokenSigned, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(
          authTokenDate.setHours(authTokenDate.getHours() + 168)
        ),
        sameSite: process.env.NODE_ENV === 'production' && 'none',
      });

      ctx.res.cookie('refresh_token', refreshTokenSigned, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(
          refreshTokenDate.setHours(refreshTokenDate.getHours() + 720)
        ),
        path: '/refreshToken',
        sameSite: process.env.NODE_ENV === 'production' && 'none',
      });

      return { user };
    } catch (error) {
      console.error(error);
      throw new ApolloError('Someting went wrong!');
    }
  }

  @Mutation(() => SuccessResponse)
  async logOut(@Ctx() ctx: Context) {
    ctx.res.clearCookie('auth_token');

    return { success: true };
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(@Arg('email') email: string) {
    try {
      const user = await User.findOne({ email });

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
        host: `${process.env.SERVER}/generateEmailToken?emailToken=${emailToken}`,
      };

      await sendMail(mail, contextData);

      return { success: true };
    } catch (error) {
      console.error(error);
      throw new ApolloError('Something went wrong');
    }
  }

  @Mutation(() => SuccessResponse)
  async resetPasswordConfirm(
    @Arg('newPassword') newPassword: string,
    @Arg('emailToken') emailToken: string
  ) {
    try {
      const jwtDecoded = jwt.verify(emailToken, secret) as DecodedEmailToken;

      const user = await User.findOne({
        where: { emailToken: jwtDecoded.emailToken },
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;
      user.save();

      return { success: true };
    } catch (error) {
      console.error(error);
      throw new AuthenticationError('Someting went wrong');
    }
  }
}
