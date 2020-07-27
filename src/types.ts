import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

export interface DecodedAuthToken {
  authToken: string;
  username: string;
}

export interface DecodedRefreshToken {
  username: string;
}
