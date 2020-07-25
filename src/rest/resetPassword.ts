import { Request, Response } from 'express';
import path from 'path';

import { nodeCache } from '../nodeCache';

export const resetPassword = (req: Request, res: Response) => {
  const resetPasswordToken = req.params.resetPasswordToken;
  const userId = nodeCache.get(resetPasswordToken);

  if (userId) {
    return res.sendFile(
      path.resolve(`${__dirname}/../resetPassword/resetPassword.html`)
    );
  } else {
    return res.send('Something went wrong!');
  }
};
