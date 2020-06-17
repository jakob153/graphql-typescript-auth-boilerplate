import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';

export const resetPasswordConfirm = async (req: Request, res: Response) => {
  const emailToken = req.param('emailToken');
  const userId = req.param('userId');

  try {
    const user = await User.findOne({ emailToken, id: parseInt(userId) });

    if (!user) {
      res.sendStatus(502);
      return;
    }

    const newEmailToken = uuid();

    user.emailToken = newEmailToken;
    user.save();

    res.redirect(`${process.env.REACT_APP}?confirmPasswordChange`);
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
};
