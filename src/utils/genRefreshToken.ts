import jwt, { Secret } from 'jsonwebtoken';
import { AuthPayload } from '../@types/custom';
import config from './config';

export function genRefreshToken(userId: string) {
  const payload: AuthPayload = { id: userId };

  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: '90d',
  });
}
