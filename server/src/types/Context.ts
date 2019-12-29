import { Request, Response } from 'express';

interface ExtendRequest extends Request {
  userId?: string;
}

export interface Context {
  req: ExtendRequest;
  res: Response;
}
