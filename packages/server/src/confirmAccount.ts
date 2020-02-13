import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from './entity/User';
import { DecodedToken } from './types/DecodedToken';

export const confirmAccount = async (req: Request, res: Response) => {
  const { emailToken: encodedEmailToken } = req.query;
  const secret = process.env.SECRET as string;
  const { sub: emailToken } = jwt.verify(encodedEmailToken, secret) as DecodedToken;
  const user = await User.findOne(emailToken);

  if (!user) {
    return res.redirect(`${process.env.FRONTEND}?confirmAccount=false`);
  }
  user.verified = true;
  user.save();
  return res.redirect(`${process.env.FRONTEND}?confirmAccount=true`);
};
