import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';

export const resetPasswordConfirm = async (req: Request, res: Response) => {
  try {
    const emailToken = res.locals.emailToken;
    const userId = req.params['userId'];
    const user = await User.findOne({ emailToken, id: parseInt(userId) });

    if (!user) {
      res.sendStatus(502);
      return;
    }

    const newEmailToken = uuid();

    user.emailToken = newEmailToken;
    user.save();

    res.json({ REACT_APP: process.env.REACT_APP });
  } catch (error) {
    res.sendStatus(502);
  }
};
