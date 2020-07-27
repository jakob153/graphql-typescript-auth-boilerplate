import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';

import { DecodedRefreshToken } from '../types';
import { nodeCache } from '../nodeCache';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!(req.cookies && req.cookies['refresh_token'])) {
    return res.send('Something went wrong');
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;
    const user = await User.findOne({ username: jwtDecoded.username });

    if (!user) {
      throw Error;
    }

    const newAuthToken = uuid();

    nodeCache.set(user.username, newAuthToken, 60 * 60 * 24);

    const authTokenSigned = jwt.sign(
      { authToken: newAuthToken, username: user.username },
      secret,
      {
        expiresIn: '24h',
      }
    );

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
