import { Request, Response } from 'express';
import path from 'path';

import { User } from '../entity/User';

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const emailToken = req.params['emailToken'];
    const userId = req.params['userId'];
    const user = await User.findOne({ emailToken, id: parseInt(userId) });

    if (!user) {
      res.sendStatus(502);
      return;
    }

    res.sendFile(
      path.resolve(`${__dirname}/../resetPassword/resetPassword.html`)
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(502);
  }
};
