import { Schema } from 'jsonschema';
import { PRIVACY_OPTIONS } from '../constants';
import { DEFAULT_LANGUAGE, DEFAULT_TITLE } from '../constants/index';

// REQUEST SCHEMAS
export const SessionSchema: Schema = {
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
    sessionTimeout: { type: 'string', format: 'date-time' },
    currentUserCount: { type: 'int', minimum: 1 },
    currentUserList: { type: 'json', minLength: 1 },
  },
  required: ['content', 'privacy'],
  additionalProperties: false,
};
