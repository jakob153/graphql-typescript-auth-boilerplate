import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../entity/User';
import { DecodedRefreshToken } from '../types';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!req.cookies['refresh_token']) {
    res.status(401).send('No Refresh Token Provided');
    return;
  }
  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    if (!jwtDecoded.refreshToken) {
      res.status(401).send('Token Invalid/Expired');
      return;
    }

    const user = await User.findOne({
      where: { refreshToken: jwtDecoded.refreshToken },
    });

    if (!user) {
      res.status(401).send('Token Invalid/Expired');
      return;
    }

    res.send(user);
  } catch (error) {
    res.status(401).send('Token Invalid/Expired');
  }
};
