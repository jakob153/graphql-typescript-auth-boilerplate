import { MiddlewareFn } from 'type-graphql';
import { ApolloError } from 'apollo-server-core';
import jwt from 'jsonwebtoken';
import { Context } from '../types/Context';

const secret = process.env.SECRET as string;

interface DecodedToken {
  sub: string | number;
  iat: number;
  exp: number;
}

export const verifyToken: MiddlewareFn<Context> = async ({ context }, next) => {
  const authToken = context.req.cookies['auth_token'];
  if (!authToken) {
    throw new ApolloError('not authenticated');
  }
  const decodedToken = jwt.verify(authToken, secret) as DecodedToken;
  if (!Object.entries(decodedToken).length) {
    throw new ApolloError('not authenticated');
  }
  context.req.userId = `${decodedToken.sub}`;

  return next();
};
