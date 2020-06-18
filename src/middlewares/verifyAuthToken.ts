import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { Context, DecodedAuthToken } from '../types';
import { AuthenticationError } from 'apollo-server-express';

const secret = process.env.SECRET as string;

export const verifyAuthToken: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  try {
    if (!context.req.headers['authorization']) {
      throw new AuthenticationError('Not Authenticated');
    }

    const authToken = context.req.headers['authorization'].split('Bearer ')[1];
    const decodedToken = jwt.verify(authToken, secret) as DecodedAuthToken;
    context.res.locals.authToken = decodedToken.authToken;

    return next();
  } catch (error) {
    throw error;
  }
};
