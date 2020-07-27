import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { redis } from '../redis';

import { User } from '../entity/User';

export const confirmResetPassword = async (req: Request, res: Response) => {
  const resetPasswordToken = req.params.resetPasswordToken;
  const newPassword = req.body.newPassword;
  const userId = await redis.get(resetPasswordToken);

  if (userId && newPassword) {
    const hashPassword = bcrypt.hashSync(newPassword, 12);

    await User.update({ id: parseInt(userId) }, { password: hashPassword });

    await redis.del(resetPasswordToken);

    return res.json({ reactApp: process.env.REACT_APP });
  } else {
    return res.sendStatus(401);
  }
};
