import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-express';
import { v4 as uuid } from 'uuid';
import { validateOrReject } from 'class-validator';

import { redis } from '../redis';

import { User } from '../entity/User';

import { sendMail } from '../mails/sendMail';

import { UserResponse } from '../graphqlTypes/UserResponse';
import { SuccessResponse } from '../graphqlTypes/SuccessResponse';

import { Context } from '../types';

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async signUp(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<SuccessResponse> {
    const existingUser = await User.find({
      where: [{ username }, { email }],
    });

    if (existingUser.length) {
      throw new UserInputError('Invalid Email/Password', {
        email: 'email already taken',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = User.create({
      username,
      email,
      password: hashedPassword,
    });

    try {
      await validateOrReject(user);
    } catch (error) {
      return { success: false };
    }

    await user.save();

    const emailToken = uuid();

    // expire in 900 seconds = 15 Minutes
    redis.set(emailToken, user.id, 'EX', 900);

    const mail = {
      email: user.email,
      subject: 'Welcome to Corperation',
      templateFilename: 'confirmAccount',
    };

    const contextData = {
      host: `${process.env.BACKEND}/confirmAccount/${emailToken}`,
    };

    sendMail(mail, contextData);

    return { success: true };
  }

  @Mutation(() => UserResponse)
  async logIn(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
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

    ctx.req.session.userId = user.id;

    return {
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  @Mutation(() => SuccessResponse)
  async logOut(@Ctx() ctx: Context): Promise<SuccessResponse> {
    ctx.req.session.destroy((err) => {
      if (err) {
        return {
          success: false,
        };
      }
    });

    return {
      success: true,
    };
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(
    @Arg('username') username: string,
    @Arg('email') email: string
  ): Promise<SuccessResponse> {
    const user = await User.findOne({ email, username });

    if (!user) {
      throw new UserInputError('User not found');
    }

    const resetPasswordToken = uuid();

    await redis.set(resetPasswordToken, user.id, 'EX', 900);

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
  }
}
