import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { nodeCache } from '../nodeCache';

import { User } from '../entity/User';

export const confirmResetPassword = async (req: Request, res: Response) => {
  const resetPasswordToken = req.params.resetPasswordToken;
  const newPassword = req.body.newPassword;
  const userId = nodeCache.get(resetPasswordToken);

  if (userId && newPassword) {
    const hashPassword = bcrypt.hashSync(newPassword, 12);

    await User.update({ id: userId as number }, { password: hashPassword });

    nodeCache.del(resetPasswordToken);

    return res.json({ reactApp: process.env.REACT_APP });
  } else {
    return res.send('Something went wrong');
  }
};
