import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { User } from './entity/User';

interface DecodedEmailToken {
  emailToken?: string;
}

export const generateEmailToken = async (req: Request, res: Response) => {
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
      res.status(400).send('Something went wrong');
      return;
    }

    const newEmailToken = uuid();

    user.emailToken = newEmailToken;
    user.save();

    const newEmailTokenSigned = jwt.sign({ emailToken: newEmailToken }, secret);

    res.redirect(`${process.env.REACT_APP}/resetPasswordConfirm?emailToken=${newEmailTokenSigned}`);
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
};
