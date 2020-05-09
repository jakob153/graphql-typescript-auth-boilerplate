import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from './entity/User';

interface DecodedRefreshToken {
  refreshToken?: string;
}

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!(req.cookies['auth_token'] && req.cookies['refresh_token'])) {
    res.status(404).send('No Auth/Refresh Token Provided');
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const jwtDecoded = jwt.verify(refreshToken, secret) as DecodedRefreshToken;

    if (!jwtDecoded.refreshToken) {
      res.status(401).send('Token Invalid/Expired');
    }

    const user = await User.findOne({ where: { refreshToken: jwtDecoded.refreshToken } });

    if (!user) {
      res.status(401).send('Token Invalid/Expired');
      return;
    }

    const authToken = jwt.sign({ authToken: user.id }, secret, {
      expiresIn: '1d',
    });
    const authTokenDate = new Date();

    // res.cookie('auth_token', authToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   expires: new Date(authTokenDate.setMonth(authTokenDate.getMonth() + 5))
    // });

    res.cookie('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(authTokenDate.setSeconds(authTokenDate.getSeconds() + 10)),
      sameSite: process.env.NODE_ENV === 'production' && 'none',
    });

    res.status(200).send('Auth Token Updated');
  } catch (error) {
    res.status(401).send('Token Invalid/Expired');
  }
};
