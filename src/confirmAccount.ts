import { Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import { User } from './entity/User';

interface DecodedEmailToken {
  emailToken?: string;
}

export const confirmAccount = async (req: Request, res: Response) => {
  const { emailToken: encodedEmailToken } = req.query;
  const secret = process.env.SECRET as string;

  jwt.verify(encodedEmailToken, secret, async (error: VerifyErrors, decoded: DecodedEmailToken) => {
    if (error || !decoded.emailToken) {
      return res.status(400).send('Something went wrong');
    }
    const { emailToken } = decoded;
    const user = await User.findOne({ emailToken });

    if (!user) {
      return res.redirect(`${process.env.REACT_APP}?confirmAccount=false`);
    }

    user.verified = true;
    user.save();

    return res.redirect(`${process.env.REACT_APP}?confirmAccount=true`);
  });
};
