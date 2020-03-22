import { MiddlewareFn } from 'type-graphql';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Context } from '../types/Context';
import { AuthenticationError } from 'apollo-server-express';

const secret = process.env.SECRET as string;

export const verifyToken: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!(context.req.cookies && context.req.cookies['auth_token'])) {
    throw new AuthenticationError('Not Authenticated');
  }
  const authToken = context.req.cookies['auth_token'];

  jwt.verify(authToken, secret, (error: VerifyErrors) => {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('TokenExpiredError');
    }
    if (error) {
      throw new AuthenticationError('Authentication Error');
    }
    return next();
  });
};
