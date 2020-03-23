import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { User } from './entity/User';

interface DecodedEmailToken {
  emailToken?: string;
}

export const generateEmailToken = async (req: Request, res: Response) => {
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
      return res.status(400).send('Something went wrong');
    }

    const newEmailToken = uuid();

    user.emailToken = newEmailToken;
    user.save();

    const newEmailTokenSigned = jwt.sign({ emailToken: newEmailToken }, secret);

    return res.redirect(
      `${process.env.REACT_APP}/resetPasswordConfirm?emailToken=${newEmailTokenSigned}`
    );
  } catch (error) {
    return res.status(400).send('Something went wrong');
  }
};
