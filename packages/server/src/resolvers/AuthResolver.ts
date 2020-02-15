import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query, UseMiddleware } from 'type-graphql';

import { sendMail } from '../utils/sendMail';
import { User } from '../entity/User';

import { Context } from '../types/Context';
import { AuthInput } from '../types/AuthInput';
import { UserResponse } from '../types/UserResponse';
import { SuccessResponse } from '../types/SuccessResponse';
import { ApolloError, UserInputError, AuthenticationError } from 'apollo-server-express';

import { v4 as uuid } from 'uuid';
import { verifyToken } from '../middlewares/verifyToken';

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async register(
    @Arg('input')
    { email, password }: AuthInput
  ) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new UserInputError('Invalid Email/Password', {
        email: 'email already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailToken = uuid();

    const user = await User.create({
      email,
      password: hashedPassword,
      emailToken
    }).save();

    const emailTokenEncoded = jwt.sign({ emailToken }, secret, {
      expiresIn: '15m'
    });

    const mail = {
      email: user.email,
      subject: 'Welcome to Blacklist',
      templateFilename: 'confirmAccount'
    };

    const contextData = {
      host: `${process.env.SERVER}/confirmAccount?emailToken=${emailTokenEncoded}`
    };

    try {
      await sendMail(mail, contextData);
      return { success: true };
    } catch (error) {
      throw new ApolloError(`Someting went wrong while sending an email. Error: ${error.message}`);
    }
  }

  @Mutation(() => UserResponse)
  async login(@Arg('input') { email, password }: AuthInput, @Ctx() ctx: Context) {
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

    const authToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: '1d'
    });

    const date = new Date();

    ctx.res.cookie('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(date.setMonth(date.getMonth() + 1))
    });

    return { user };
  }

  @Mutation(() => SuccessResponse)
  async logout(@Ctx() ctx: Context) {
    ctx.res.clearCookie('auth_token');

    return { success: true };
  }

  @Query(() => UserResponse)
  @UseMiddleware(verifyToken)
  async getCurrentUser(@Ctx() ctx: Context) {
    const user = await User.findOne(ctx.req.userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return { user };
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(@Arg('email') email: string) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new UserInputError('User not found');
    }

    const newEmailToken = uuid();

    user.emailToken = newEmailToken;
    user.save();

    const emailToken = jwt.sign({ sub: newEmailToken }, secret, {
      expiresIn: '15m'
    });

    const mail = {
      email: user.email,
      subject: 'Reset Password',
      templateFilename: 'resetPassword'
    };

    const contextData = {
      host: `${process.env.REACT_APP}/resetPasswordConfirm?emailToken=${emailToken}`
    };

    try {
      await sendMail(mail, contextData);
      return { success: true };
    } catch (error) {
      throw new ApolloError(`Something went wrong while sending the mail. Error: ${error.message}`);
    }
  }

  @Mutation(() => SuccessResponse)
  async resetPasswordConfirm(
    @Arg('oldPassword') oldPassword: string,
    @Arg('newPassword') newPassword: string,
    @Arg('emailToken') emailToken: string
  ) {
    const emailTokenDecoded = jwt.sign(emailToken, secret);
    const user = await User.findOne({ where: { emailToken: emailTokenDecoded } });

    if (!user) {
      throw new AuthenticationError('User not found');
    }
    const valid = await bcrypt.compare(oldPassword, user.password);

    if (!valid) {
      throw new AuthenticationError('Old Password invalid');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.save();

    return { success: true };
  }
}
