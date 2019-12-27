import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';

import { sendMail } from '../utils/sendMail';
import { User } from '../entity/User';
import { Context } from 'src/types/Context';
import { AuthInput } from '../types/AuthInput';
import { UserResponse } from '../types/UserResponse';
import { MailResponse } from '../types/MailResponse';

interface JWTToken {
  sub: string;
}

const invalidLoginResponse = {
  errors: [
    {
      path: 'email',
      message: 'invalid login'
    }
  ]
};

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => MailResponse)
  async register(
    @Arg('input')
    { email, password }: AuthInput
  ): Promise<MailResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        success: false,
        errors: [
          {
            path: 'register',
            message: 'already in use'
          }
        ]
      };
    }

    const user = await User.create({
      email,
      password: hashedPassword
    }).save();

    const emailToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: '15m'
    });

    const mail = {
      email: user.email,
      subject: 'Welcome to Blacklist',
      templateFilename: 'accountConfirm'
    };

    const contextData = {
      host: `${process.env.BACKEND}/confirmAccount?emailToken=${emailToken}`
    };

    try {
      await sendMail(mail, contextData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: 'register',
            message: error.message
          }
        ]
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('input') { email, password }: AuthInput,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return invalidLoginResponse;
    }

    if (!user.verified) {
      return invalidLoginResponse;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return invalidLoginResponse;
    }

    const authToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: '1d'
    });

    ctx.res.cookie('auth_token', authToken, { httpOnly: true });

    return { user };
  }

  @Query(() => MailResponse)
  async resetPassword(@Arg('email') email: string): Promise<MailResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        errors: [
          {
            path: 'resetPassword',
            message: 'User not found'
          }
        ]
      };
    }

    const emailToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: '15m'
    });

    const mail = {
      email: user.email,
      subject: 'Reset Password',
      templateFilename: 'passwordReset'
    };

    const contextData = {
      emailToken,
      host: process.env.FRONTEND as string
    };

    try {
      await sendMail(mail, contextData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        errors: [
          {
            path: 'resetPassword',
            message: err.message
          }
        ]
      };
    }
  }

  @Mutation(() => MailResponse)
  async resetPasswordConfirm(
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<MailResponse> {
    const { sub } = jwt.verify(ctx.req.query.emailToken, secret) as JWTToken;
    const user = await User.findOne(sub);

    if (!user) {
      return {
        success: false,
        errors: [
          {
            path: 'resetPasswordConfirm',
            message: 'User not Found'
          }
        ]
      };
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.save();

    return { success: true };
  }
}
