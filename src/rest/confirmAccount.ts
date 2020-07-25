import { Request, Response } from 'express';

import { nodeCache } from '../nodeCache';

import { User } from '../entity/User';

export const confirmAccount = async (req: Request, res: Response) => {
  const { emailToken } = req.params;
  const userId = nodeCache.get(emailToken);

  if (userId) {
    await User.update({ id: userId as number }, { verified: true });
    nodeCache.del(emailToken);

    return res.redirect(`${process.env.REACT_APP}/login?confirmAccount=true`);
  } else {
    return res.send('Something went wrong');
  }
};
