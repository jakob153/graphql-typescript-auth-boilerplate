import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { redis } from '../redis';

import { DecodedRefreshToken } from '../types';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (
    !(
      req.cookies &&
      req.cookies['refresh_token'] &&
      (await redis.get(req.cookies['refresh_token']))
    )
  ) {
    return res.sendStatus(401);
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    const newAuthToken = uuid();

    const authTokenSigned = jwt.sign({ authToken: newAuthToken }, secret, {
      expiresIn: '24h',
    });

    const lightUser = {
      username: jwtDecoded.username,
      email: jwtDecoded.email,
      authToken: authTokenSigned,
    };

    return res.send(lightUser);
  } catch (error) {
    return res.sendStatus(401);
  }
};
