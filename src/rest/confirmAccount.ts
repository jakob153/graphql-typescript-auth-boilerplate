import { Request, Response } from 'express';

import { redis } from '../redis';

import { User } from '../entity/User';

export const confirmAccount = async (req: Request, res: Response) => {
  const { emailToken } = req.params;
  const userId = await redis.get(emailToken);

  if (userId) {
    await User.update({ id: parseInt(userId) }, { verified: true });

    redis.del(emailToken);

    return res.redirect(`${process.env.REACT_APP}/login?confirmAccount=true`);
  } else {
    return res.sendStatus(401);
  }
};
