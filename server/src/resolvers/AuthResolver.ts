import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';

import { sendMail } from '../utils/sendMail';
import { User } from '../entity/User';

import { Context } from 'src/types/Context';
import { AuthInput } from '../types/AuthInput';
import { UserResponse } from '../types/UserResponse';
import { SuccessResponse } from '../types/SuccessResponse';
import { DecodedToken } from '../types/DecodedToken';

interface JWTToken {
  sub: string;
}

interface InvalidLoginResponse {
  errors: Array<{ path: string; message: string }>;
}

const invalidLoginResponse = (path = 'login'): InvalidLoginResponse => ({
  errors: [
    {
      path,
      message: 'invalid login'
    }
  ]
});

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async register(
    @Arg('input')
    { email, password }: AuthInput
  ): Promise<SuccessResponse> {
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
      templateFilename: 'confirmAccount'
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
      return invalidLoginResponse('email');
    }

    if (!user.verified) {
      return invalidLoginResponse('verified');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return invalidLoginResponse();
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

  @Query(() => UserResponse)
  async getCurrentUser(@Ctx() ctx: Context): Promise<UserResponse> {
    const authToken = ctx.req.cookies['auth_token'];
    if (!authToken) {
      return {
        errors: [
          {
            path: 'authToken',
            message: 'No authToken'
          }
        ]
      };
    }
    const decodedToken = jwt.verify(authToken, secret) as DecodedToken;
    const user = await User.findOne(decodedToken.sub);

    if (!user) {
      return {
        errors: [
          {
            path: 'email',
            message: 'User not found'
          }
        ]
      };
    }
    return { user };
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(@Arg('email') email: string): Promise<SuccessResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        errors: [
          {
            path: 'email',
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
      templateFilename: 'resetPassword'
    };

    const contextData = {
      emailToken,
      host: `${process.env.FRONTEND}/resetPasswordConfirm?emailToken=${emailToken}`
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

  @Mutation(() => SuccessResponse)
  async resetPasswordConfirm(
    @Arg('oldPassword') oldPassword: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() ctx: Context
  ): Promise<SuccessResponse> {
    const decodedToken = jwt.verify(
      ctx.req.query.emailToken,
      secret
    ) as JWTToken;

    if (!decodedToken) {
      return {
        success: false,
        errors: [
          {
            path: 'resetPasswordConfirm',
            message: 'Token expired'
          }
        ]
      };
    }

    const user = await User.findOne(decodedToken.sub);

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
    const valid = await bcrypt.compare(oldPassword, user.password);

    if (!valid) {
      return {
        success: false,
        errors: [
          {
            path: 'resetPasswordConfirm',
            message: 'Invalid Operation'
          }
        ]
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.save();

    return { success: true };
  }
}
