import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

export interface DecodedAuthToken {
  authToken: string;
}

export interface DecodedRefreshToken {
  username: string;
  email: string;
}
