import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { DecodedEmailToken } from '../types';

export const verifyEmailToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.SECRET as string;
    const emailToken = req.params['emailToken'];

    if (!emailToken) {
      return res.sendStatus(502);
    }

    const decoded = jwt.verify(emailToken, secret) as DecodedEmailToken;
    res.locals.emailToken = decoded.emailToken;

    return next();
  } catch (error) {
    throw error;
  }
};
