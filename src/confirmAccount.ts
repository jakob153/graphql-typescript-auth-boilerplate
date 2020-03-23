import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from './entity/User';

interface DecodedEmailToken {
  emailToken?: string;
}

export const confirmAccount = async (req: Request, res: Response) => {
  const { emailToken: encodedEmailToken } = req.query;
  const secret = process.env.SECRET as string;

  if (!encodedEmailToken) {
    return res.status(404).send('No Email Token Provided');
  }

  try {
    const { emailToken } = jwt.verify(encodedEmailToken, secret) as DecodedEmailToken;

    if (!emailToken) {
      return res.status(400).send('Something went wrong');
    }

    const user = await User.findOne({ emailToken });

    if (!user) {
      return res.redirect(`${process.env.REACT_APP}/login?confirmAccount=false`);
    }

    user.verified = true;
    user.save();

    return res.redirect(`${process.env.REACT_APP}/login?confirmAccount=true`);
  } catch (error) {
    return res.status(400).send('Something went wrong');
  }
};
