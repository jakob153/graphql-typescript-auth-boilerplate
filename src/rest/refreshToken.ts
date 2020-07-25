import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { redis } from '../redis';

import { User } from '../entity/User';

import { DecodedRefreshToken } from '../types';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!req.cookies['refresh_token']) {
    return res.status(401).send('Something went wrong');
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    if (!jwtDecoded.refreshToken) {
      throw Error;
    }

    const userId = await redis.get(jwtDecoded.refreshToken);

    if (userId) {
      const user = await User.findOne({ id: parseInt(userId) });

      if (!user) {
        throw Error;
      }

      const newAuthToken = uuid();
      const authTokenSigned = jwt.sign({ authToken: newAuthToken }, secret, {
        expiresIn: '1d',
      });

      const lightUser = {
        username: user.username,
        email: user.email,
        authToken: authTokenSigned,
      };
      return res.send(lightUser);
    } else {
      throw Error;
    }
  } catch (error) {
    return res.send('Something went wrong');
  }
};

export const deleteRefreshToken = async (req: Request, res: Response) => {
  if (!req.cookies['refresh_token']) {
    return res.send('Something went wrong');
  }
  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    if (!jwtDecoded.refreshToken) {
      throw Error;
    }

    await redis.del(jwtDecoded.refreshToken);

    res.clearCookie('refresh_token', { path: '/refreshToken' });

    return res.sendStatus(200);
  } catch (error) {
    return res.send('Something went wrong');
  }
};
