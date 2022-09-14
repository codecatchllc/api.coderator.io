import { Schema as JsonSchema } from 'jsonschema';

declare module 'jsonschema' {
  export default interface Schema extends JsonSchema {
    default?: string;
  }
}
