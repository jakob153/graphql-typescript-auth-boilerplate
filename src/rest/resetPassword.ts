import { Request, Response } from 'express';
import path from 'path';

import { redis } from '../redis';

export const resetPassword = async (req: Request, res: Response) => {
  const resetPasswordToken = req.params.resetPasswordToken;
  const userId = await redis.get(resetPasswordToken);

  if (userId) {
    return res.sendFile(
      path.resolve(`${__dirname}/../resetPassword/resetPassword.html`)
    );
  } else {
    return res.sendStatus(401);
  }
};
