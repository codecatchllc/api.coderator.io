import jwt, { Secret } from 'jsonwebtoken';
import { AuthPayload } from '../@types/custom';
import config from './config';

export function genAccessToken(userId: number) {
  const payload: AuthPayload = { id: userId };

  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET as Secret, {
    expiresIn: '24h',
  });
}
