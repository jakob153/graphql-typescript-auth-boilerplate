import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from './entity/User';

interface DecodedRefreshToken {
  refreshToken?: string;
}

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response) => {
  if (!(req.cookies['auth_token'] && req.cookies['refresh_token'])) {
    return res.status(404).send('No Auth/Refresh Token Provided');
  }

  const refreshToken = req.cookies['refresh_token'];

  try {
    const { refreshToken: decodedRefreshToken } = jwt.verify(
      refreshToken,
      secret
    ) as DecodedRefreshToken;
    if (!decodedRefreshToken) {
      return res.status(401).send('Token Invalid/Expired');
    }

    const user = await User.findOne({ where: { refreshToken: decodedRefreshToken } });
    if (!user) {
      return res.status(401).send('Token Invalid/Expired');
    }

    const authToken = jwt.sign({ authToken: user.id }, secret, {
      expiresIn: '1d'
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
      sameSite: process.env.NODE_ENV === 'production' && 'none'
    });

    return res.status(200).send('Auth Token Updated');
  } catch (error) {
    return res.status(401).send('Token Invalid/Expired');
  }
};
