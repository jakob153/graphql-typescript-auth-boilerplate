import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-express';
import { v4 as uuid } from 'uuid';
import { validateOrReject } from 'class-validator';

import { redis } from '../redis';

import { DI } from '../app';
import { User } from '../entities/User';

import { sendMail } from '../mails/sendMail';

import { UserResponse } from '../graphqlTypes/UserResponse';

import { Context } from '../types';

@Resolver()
export class AuthResolver {
  @Mutation(() => Boolean)
  async signUp(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<boolean> {
    const existingUser = await DI.userRepository.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new UserInputError('Email/Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User(username, email, hashedPassword);

    try {
      await validateOrReject(user);
    } catch (error) {
      return false;
    }

    await DI.userRepository.persistAndFlush(user);

    const emailToken = uuid();

    // expire in 900 seconds = 15 Minutes
    await redis.set(`emailToken: ${emailToken}`, user.id, 'EX', 900);

    sendMail(
      user.email,
      'Welcome to Corperation',
      'confirmAccount',
      `${process.env.FRONTEND}?confirmAccount=${emailToken}`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async logIn(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    const user = await DI.userRepository.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
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

  @Query(() => UserResponse)
  async checkSession(@Ctx() ctx: Context): Promise<UserResponse> {
    if (!ctx.req.session.userId) {
      throw new AuthenticationError('No Session found');
    }

    const user = await DI.userRepository.findOne({
      id: ctx.req.session.userId,
    });

    if (!user) {
      throw new UserInputError('User not found');
    }

    if (!user.verified) {
      throw new AuthenticationError('User not verified');
    }

    return {
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  @Mutation(() => Boolean)
  async logOut(@Ctx() ctx: Context): Promise<boolean> {
    ctx.req.session.destroy((err) => {
      if (err) {
        return false;
      }
    });

    return true;
  }

  @Mutation(() => Boolean)
  async confirmAccount(
    @Arg('emailToken') emailToken: string
  ): Promise<boolean> {
    const userId = await redis.get(`emailToken: ${emailToken}`);

    if (!userId) {
      return false;
    }

    const user = await DI.userRepository.findOne(parseInt(userId));

    if (!user) {
      return false;
    }

    user.verified = true;

    await DI.userRepository.flush();

    redis.del(emailToken);

    return true;
  }

  @Mutation(() => Boolean)
  async sendChangePasswordMail(@Arg('email') email: string): Promise<boolean> {
    const user = await DI.userRepository.findOne({ email });

    if (!user) {
      throw new UserInputError('User not found');
    }

    const changePasswordToken = uuid();

    await redis.set(
      `changePasswordToken: ${changePasswordToken}`,
      user.id,
      'EX',
      900
    );

    await sendMail(
      user.email,
      'Reset Password',
      'resetPassword',
      `${process.env.FRONTEND}/changePassword/${changePasswordToken}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('changePasswordToken') changePasswordToken: string
  ): Promise<boolean> {
    const userId = await redis.get(
      `changePasswordToken: ${changePasswordToken}`
    );

    if (!userId) {
      return false;
    }

    const user = await DI.userRepository.findOne(parseInt(userId));

    if (!user) {
      return false;
    }

    const hashPassword = bcrypt.hashSync(newPassword, 12);
    user.password = hashPassword;

    await DI.userRepository.flush();

    await redis.del(changePasswordToken);

    return true;
  }
}
