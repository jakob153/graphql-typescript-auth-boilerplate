import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { Context } from '../types/Context';
import { DecodedToken } from '../types/DecodedToken';
import { AuthenticationError } from 'apollo-server-express';

const secret = process.env.SECRET as string;

export const verifyToken: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!(context.req.cookies && context.req.cookies['auth_token'])) {
    throw new AuthenticationError('Not Authenticated');
  }
  const authToken = context.req.cookies['auth_token'];

  const decodedToken = jwt.verify(authToken, secret) as DecodedToken;
  if (!decodedToken.sub) {
    throw new AuthenticationError('Not Authenticated');
  }
  context.req.userId = `${decodedToken.sub}`;

  return next();
};
