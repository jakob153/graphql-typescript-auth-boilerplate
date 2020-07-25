import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

export interface DecodedAuthToken {
  authToken?: string;
}

export interface DecodedRefreshToken {
  userId?: string;
}

export interface DecodedEmailToken {
  emailToken?: string;
}
