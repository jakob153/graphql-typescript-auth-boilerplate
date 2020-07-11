import { Request, Response } from 'express';

import { User } from '../entity/User';

export const confirmAccount = async (req: Request, res: Response) => {
  if (!req.query.emailToken) {
    res.status(404).send('No Email Token Provided');
    return;
  }

  try {
    const emailToken = req.query.emailToken;
    const user = await User.findOne({ emailToken });

    if (!user) {
      res.redirect(`${process.env.REACT_APP}/login?confirmAccount=false`);
      return;
    }

    user.verified = true;
    user.save();

    res.redirect(`${process.env.REACT_APP}/login?confirmAccount=true`);
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
};
