import { Schema } from 'jsonschema';

export const errorResponseSchema: Schema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
};
