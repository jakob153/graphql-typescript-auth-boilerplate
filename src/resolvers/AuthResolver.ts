import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-express';
import { v4 as uuid } from 'uuid';
import { validateOrReject } from 'class-validator';

import { redis } from '../redis';

import { User } from '../entity/User';

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
      return false;
    }

    await user.save();

    const emailToken = `emailToken: ${uuid()}`;

    // expire in 900 seconds = 15 Minutes
    redis.set(emailToken, user.id, 'EX', 900);

    sendMail(
      user.email,
      'Welcome to Corperation',
      'confirmAccount',
      `${process.env.FRONTEND}/confirmAccount/${emailToken}`
    );

    return true;
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

  @Query(() => UserResponse)
  async checkSession(@Ctx() ctx: Context): Promise<UserResponse> {
    if (!ctx.req.session.userId) {
      throw new AuthenticationError('No Session found');
    }

    const user = await User.findOne({
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
  async confirmAccount(emailToken: string): Promise<boolean> {
    const userId = await redis.get(`emailToken: ${emailToken}`);

    if (!userId) {
      return false;
    }

    await User.update({ id: parseInt(userId) }, { verified: true });

    redis.del(emailToken);

    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(@Arg('email') email: string): Promise<boolean> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new UserInputError('User not found');
    }

    const resetPasswordToken = `resetPasswordToken: ${uuid()}`;

    await redis.set(resetPasswordToken, user.id, 'EX', 900);

    await sendMail(
      user.email,
      'Reset Password',
      'resetPassword',
      `${process.env.FRONTEND}/resetPassword/${resetPasswordToken}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  async confirmResetPassword(
    @Arg('newPassword') newPassword: string,
    @Arg('resetPasswordToken') resetPasswordToken: string
  ): Promise<boolean> {
    const userId = await redis.get(`resetPasswordToken: ${resetPasswordToken}`);

    if (!userId) {
      return false;
    }

    const hashPassword = bcrypt.hashSync(newPassword, 12);

    await User.update({ id: parseInt(userId) }, { password: hashPassword });

    await redis.del(resetPasswordToken);

    return true;
  }
}
