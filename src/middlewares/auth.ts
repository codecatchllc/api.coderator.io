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
  /*Token error response is triggered here*/

  //console.log({authorizationHeader})

  /*missing header?*/
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

export const getRequestUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(
            token,
            config.ACCESS_TOKEN_SECRET as Secret
        ) as AuthPayload;
        req.user = decoded;
      }
    }
  } catch (error) {
    console.error('getRequestUser() error: ', error);
    res.status(500).json({
      error: 'There was a server-side issue while fetching the request user',
    });
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
