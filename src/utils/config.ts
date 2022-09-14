import 'dotenv/config';
import process from 'process';

export default {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT as string, 10) || 5000,
  PROTOCOL: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  CLIENT_URL: process.env.CLIENT_URL || 'localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
  NODEMAILER_HOST: process.env.NODEMAILER_HOST || 'smtp.ethereal.email',
  NODEMAILER_PORT: parseInt(process.env.NODEMAILER_PORT as string, 10) || 25,
  NODEMAILER_SECURE: process.env.NODEMAILER_SECURE
    ? process.env.NODEMAILER_SECURE === 'true'
    : false,
  NODEMAILER_USER: process.env.NODEMAILER_USER || undefined,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS || undefined,
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  CODECATCH_EMAIL: process.env.CODECATCH_EMAIL || 'codecatchservice@gmail.com',
};
