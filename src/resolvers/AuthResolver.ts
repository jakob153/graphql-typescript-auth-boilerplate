import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { ApolloError, UserInputError, AuthenticationError } from 'apollo-server-express';
import { v4 as uuid } from 'uuid';

import { sendMail } from '../mails/sendMail';
import { User } from '../entity/User';

import { Context } from '../types/Context';
import { AuthInput } from '../types/AuthInput';
import { UserResponse } from '../types/UserResponse';
import { SuccessResponse } from '../types/SuccessResponse';

const secret = process.env.SECRET as string;

@Resolver()
export class AuthResolver {
  @Mutation(() => SuccessResponse)
  async signUp(
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
    const refreshToken = uuid();

    const user = await User.create({
      email,
      password: hashedPassword,
      emailToken,
      refreshToken
    }).save();

    const emailTokenSigned = jwt.sign({ emailToken }, secret, {
      expiresIn: '15m'
    });

    const mail = {
      email: user.email,
      subject: 'Welcome to Blacklist',
      templateFilename: 'confirmAccount'
    };

    const contextData = {
      host: `${process.env.SERVER}/confirmAccount?emailToken=${emailTokenSigned}`
    };

    try {
      await sendMail(mail, contextData);
      return { success: true };
    } catch (error) {
      throw new ApolloError(`Someting went wrong while sending an email. Error: ${error.message}`);
    }
  }

  @Mutation(() => UserResponse)
  async logIn(@Arg('input') { email, password }: AuthInput, @Ctx() ctx: Context) {
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

    const { refreshToken } = user;

    // const authToken = jwt.sign({ sub: user.id }, secret, {
    //   expiresIn: '1d'
    // });
    const authToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: 10
    });

    const authTokenDate = new Date();
    const refreshTokenDate = new Date();

    ctx.res.cookie('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(authTokenDate.setMonth(authTokenDate.getMonth() + 5))
    });

    ctx.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(refreshTokenDate.setMonth(refreshTokenDate.getMonth() + 6))
    });

    return { user };
  }

  @Mutation(() => SuccessResponse)
  async logOut(@Ctx() ctx: Context) {
    ctx.res.clearCookie('auth_token');

    return { success: true };
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
