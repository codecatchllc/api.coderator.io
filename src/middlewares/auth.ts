import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { AuthPayload } from '../@types/custom';
import config from '../utils/config';

export const authenticateWithToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    res.status(403).json({ error: 'A token is required for authentication' });
    return;
  }
  const token = authorizationHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      config.ACCESS_TOKEN_SECRET as Secret
    ) as AuthPayload;
    req.user = decoded;
  } catch (error) {
    res.status(401).json({ error: 'Unable to authorize user token' });
    return;
  }
  next();
};

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(401).json({ error: "You don't have access to this resource" });
    return;
  }

  next();
};
