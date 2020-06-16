import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

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
      throw Error;
    }

    const user = await User.findOne({
      refreshToken: jwtDecoded.refreshToken,
    });

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

    res.send(lightUser);
  } catch (error) {
    res.status(401).send('Token Invalid/Expired');
  }
};
