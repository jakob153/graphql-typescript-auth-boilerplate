import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from './entity/User';

interface JWTToken {
  sub: string;
}

export const confirmAccount = async (req: Request, res: Response): Promise<void> => {
  const { emailToken } = req.query;
  const secret = process.env.SECRET as string;
  const { sub } = jwt.verify(emailToken, secret) as JWTToken;
  const user = await User.findOne(sub);

  if (!user) {
    return res.redirect(`${process.env.FRONTEND}?confirmAccount=false`);
  }
  user.verified = true;
  user.save();
  return res.redirect(`${process.env.FRONTEND}?confirmAccount=true`);
};
