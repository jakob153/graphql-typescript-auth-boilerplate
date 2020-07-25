import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';

import { DecodedRefreshToken } from '../types';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!(req.cookies && req.cookies['refresh_token'])) {
    return res.send('Something went wrong');
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    if (!jwtDecoded.userId) {
      throw Error;
    }

    const user = await User.findOne({ id: parseInt(jwtDecoded.userId) });

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
  } catch (error) {
    return res.send('Something went wrong');
  }
};
