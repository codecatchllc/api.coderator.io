import { Schema } from 'jsonschema';
import { postResponseSchema } from './post';

// REQUEST SCHEMAS
export const loginSchema: Schema = {
  type: 'object',
  properties: {
    usernameOrEmail: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['usernameOrEmail', 'password'],
  additionalProperties: false,
};

export const registerSchema: Schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', minLength: 3 },
    username: { type: 'string', minLength: 3 },
    password: { type: 'string', minLength: 7 },
    confirmPassword: { type: 'string', minLength: 7 },
    captcha: { type: 'string' },
  },
  required: ['email', 'username', 'password', 'confirmPassword', 'captcha'],
  additionalProperties: false,
};

export const forgotPasswordSchema: Schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
  },
  required: ['email'],
  additionalProperties: false,
};

export const changePasswordSchema: Schema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
    password: { type: 'string', minLength: 7 },
    confirmPassword: { type: 'string', minLength: 7 },
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
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
  },
  additionalProperties: false,
};

// RESPONSE SCHEMAS
export const userResponseSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
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
