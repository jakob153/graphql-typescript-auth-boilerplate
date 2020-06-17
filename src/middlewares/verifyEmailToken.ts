import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const verifyEmailToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.SECRET as string;
    const emailToken = req.param('emailToken');

    if (!emailToken) {
      return res.sendStatus(502);
    }

    jwt.verify(emailToken, secret);

    return next();
  } catch (error) {
    throw error;
  }
};
