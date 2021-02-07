import { AuthenticationError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';

import { Context } from '../types';

export const verifySession: MiddlewareFn<Context> = async (
  { context: ctx },
  next
) => {
  if (ctx.req.session.id) {
    return next();
  } else {
    throw new AuthenticationError('Not Authenticated');
  }
};
