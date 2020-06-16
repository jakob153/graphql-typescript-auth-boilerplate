import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { Context } from '../types';
import { AuthenticationError } from 'apollo-server-express';

const secret = process.env.SECRET as string;

export const verifyToken: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.req.headers['authorization']) {
    throw new AuthenticationError('Not Authenticated');
  }

  const authToken = context.req.headers['authorization'].split('Bearer ')[1];

  try {
    jwt.verify(authToken, secret);
    return next();
  } catch (error) {
    throw error;
  }
};
