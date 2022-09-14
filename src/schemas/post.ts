import { Schema } from 'jsonschema';
import { LANGUAGE_OPTIONS, PRIVACY_OPTIONS } from '../constants';
import { DEFAULT_LANGUAGE, DEFAULT_TITLE } from './../constants/index';

// REQUEST SCHEMAS
export const postSchema: Schema = {
  type: 'object',
  properties: {
    title: { type: 'string', default: DEFAULT_TITLE },
    content: { type: 'string', minLength: 1 },
    language: {
      type: 'string',
      default: DEFAULT_LANGUAGE,
    },
    privacy: { type: 'string', enum: PRIVACY_OPTIONS },
    expirationDate: { type: 'string', format: 'date-time' },
  },
  required: ['content', 'privacy'],
  additionalProperties: false,
};

export const getSimilarPostsSchema: Schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    language: { type: 'string', enum: LANGUAGE_OPTIONS },
  },
  required: ['title', 'language'],
  additionalProperties: false,
};

// RESPONSE SCHEMAS
export const postResponseSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
    language: {
      type: 'string',
    },
    privacy: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    expirationDate: { type: 'string', format: 'date-time' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        username: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
      },
    },
  },
};
