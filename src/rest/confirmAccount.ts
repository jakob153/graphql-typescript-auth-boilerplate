import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../entity/User';
import { DecodedEmailToken } from '../types/types';

export const confirmAccount = async (req: Request, res: Response) => {
  const secret = process.env.SECRET as string;

  if (!req.query.emailToken) {
    res.status(404).send('No Email Token Provided');
  }

  try {
    const jwtDecoded = jwt.verify(req.query.emailToken, secret) as DecodedEmailToken;

    if (!jwtDecoded.emailToken) {
      res.status(400).send('Something went wrong');
    }

    const user = await User.findOne({ emailToken: jwtDecoded.emailToken });

    if (!user) {
      res.redirect(`${process.env.REACT_APP}/login?confirmAccount=false`);
      return;
    }

    user.verified = true;
    user.save();

    res.redirect(`${process.env.REACT_APP}/login?confirmAccount=true`);
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
};
