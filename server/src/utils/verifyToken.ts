import { MiddlewareFn } from 'type-graphql';
import { ApolloError } from 'apollo-server-core';
import { Context } from '../types/Context';

export const verifyToken: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.req.cookies['auth_token']) {
    throw new ApolloError('not authenticated');
  }

  return next();
};
