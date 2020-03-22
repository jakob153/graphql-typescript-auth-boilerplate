import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import { User } from './entity/User';

const secret = process.env.SECRET as string;

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!(req.cookies['auth_token'] && req.cookies['refresh_token'])) {
    return res.status(400).send('No Auth/Refresh Token Provided');
  }

  const refreshToken = req.cookies['refresh_token'];

  jwt.verify(refreshToken, secret, async (error: VerifyErrors) => {
    if (error.name === 'TokenExpiredError') {
      return res.redirect(
        `${process.env.REACT_APP}/login?redirectMessage="Session Expired. Please Log In Again"`
      );
    }

    if (error) {
      return res.status(400).send('Token Invalid/Expired');
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(400).send('Token Invalid /Expired');
    }

    const authToken = jwt.sign({ sub: user.id }, secret, {
      expiresIn: 10
    });

    const authTokenDate = new Date();

    res.cookie('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(authTokenDate.setMonth(authTokenDate.getMonth() + 5))
    });
  });

  return next();
};
