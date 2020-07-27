import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError } from 'apollo-server-express';

import { nodeCache } from '../nodeCache';

import { Context, DecodedAuthToken } from '../types';

const secret = process.env.SECRET as string;

export const verifyAuthToken: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  if (!context.req.headers['authorization']) {
    throw new AuthenticationError('Not Authenticated');
  }

  const authToken = context.req.headers['authorization'].split('Bearer ')[1];

  try {
    const decodedToken = jwt.verify(authToken, secret) as DecodedAuthToken;

    if (nodeCache.has(decodedToken.username)) {
      if (nodeCache.get(decodedToken.username) === decodedToken.authToken) {
        return next();
      }
    }

    throw new AuthenticationError('Not Authenticated');
  } catch (error) {
    return new ApolloError('Something went wrong');
  }
};
