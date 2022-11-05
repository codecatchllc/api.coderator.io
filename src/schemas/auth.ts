import { Schema } from 'jsonschema';
import {
  PASSWORD_CHAR_MAX,
  PASSWORD_CHAR_MIN,
  USERNAME_CHAR_MAX,
  USERNAME_CHAR_MIN,
} from '../constants';
import { EMAIL_CHAR_MAX, EMAIL_CHAR_MIN } from './../constants/index';
import { postResponseSchema } from './post';

// REQUEST SCHEMAS
export const loginSchema: Schema = {
  type: 'object',
  properties: {
    usernameOrEmail: {
      type: 'string',
      minLength: USERNAME_CHAR_MIN,
      maxLength: USERNAME_CHAR_MAX,
    },
    password: {
      type: 'string',
      minLength: PASSWORD_CHAR_MIN,
      maxLength: PASSWORD_CHAR_MAX,
    },
    captcha: { type: 'string' },
  },
  required: ['usernameOrEmail', 'password', 'captcha'],
  additionalProperties: false,
};

export const registerSchema: Schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      minLength: EMAIL_CHAR_MIN,
      maxLength: EMAIL_CHAR_MAX,
    },
    username: {
      type: 'string',
      minLength: USERNAME_CHAR_MIN,
      maxLength: USERNAME_CHAR_MAX,
    },
    password: {
      type: 'string',
      minLength: PASSWORD_CHAR_MIN,
      maxLength: PASSWORD_CHAR_MAX,
    },
    confirmPassword: {
      type: 'string',
      minLength: PASSWORD_CHAR_MIN,
      maxLength: PASSWORD_CHAR_MAX,
    },
    captcha: { type: 'string' },
  },
  required: ['email', 'username', 'password', 'confirmPassword', 'captcha'],
  additionalProperties: false,
};

export const authenticateWithOAuthSchema: Schema = {
  type: 'object',
  properties: {
    encodedUser: {
      type: 'string',
    },
  },
  required: ['encodedUser'],
  additionalProperties: false,
};

export const forgotPasswordSchema: Schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      minLength: EMAIL_CHAR_MIN,
      maxLength: EMAIL_CHAR_MAX,
    },
  },
  required: ['email'],
  additionalProperties: false,
};

export const changePasswordSchema: Schema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
    password: {
      type: 'string',
      minLength: PASSWORD_CHAR_MIN,
      maxLength: PASSWORD_CHAR_MAX,
    },
    confirmPassword: {
      type: 'string',
      minLength: PASSWORD_CHAR_MIN,
      maxLength: PASSWORD_CHAR_MAX,
    },
  },
  required: ['token', 'password', 'confirmPassword'],
  additionalProperties: false,
};

export const refreshTokenSchema: Schema = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' },
  },
  required: ['refreshToken'],
  additionalProperties: false,
};

export const editUserSchema: Schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      minLength: EMAIL_CHAR_MIN,
      maxLength: EMAIL_CHAR_MAX,
    },
    username: { type: 'string' },
  },
  additionalProperties: false,
};

// RESPONSE SCHEMAS
export const userResponseSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    lastLoginAt: { type: 'string', format: 'date-time' },
    isActive: { type: 'boolean' },
    accessToken: { type: 'string' },
    accessTokenExpires: { type: 'integer' },
    refreshToken: { type: 'string' },
    posts: {
      type: 'array',
      items: postResponseSchema,
    },
  },
};

export const refreshTokenResponseSchema: Schema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    accessTokenExpires: { type: 'integer' },
    refreshToken: { type: 'string' },
  },
};
