import { Request, Response } from 'express';
import { User } from '../entity/User';

export const resetPassword = async (req: Request, res: Response) => {
  const userId = req.param('userId');

  try {
    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      res.sendStatus(502);
      return;
    }

    res.sendFile('../resetPassword/resetPassword.html');
  } catch (error) {
    console.error(error);
    res.sendStatus(502);
  }
};
