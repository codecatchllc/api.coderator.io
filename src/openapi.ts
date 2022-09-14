import swaggerJSDoc, { Reference } from 'swagger-jsdoc';
import { errorResponseSchema } from './schemas';
import {
  changePasswordSchema,
  editUserSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenResponseSchema,
  refreshTokenSchema,
  registerSchema,
  userResponseSchema,
} from './schemas/auth';
import {
  getSimilarPostsSchema,
  postResponseSchema,
  postSchema,
} from './schemas/post';

const options: swaggerJSDoc.OAS3Options = {
  definition: {
    openapi: '3.0.0.',
    info: {
      title: 'CodeCatch React API',
      version: '1.1.1',
      description: 'A REST+JSON API service for CodeCatch projects',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      schemas: {
        loginSchema: loginSchema as Reference,
        registerSchema: registerSchema as Reference,
        forgotPasswordSchema: forgotPasswordSchema as Reference,
        changePasswordSchema: changePasswordSchema as Reference,
        refreshTokenSchema: refreshTokenSchema as Reference,
        editUserSchema: editUserSchema as Reference,
        postSchema: postSchema as Reference,
        getSimilarPostsSchema: getSimilarPostsSchema as Reference,
        User: userResponseSchema as Reference,
        RefreshToken: refreshTokenResponseSchema as Reference,
        Post: postResponseSchema as Reference,
        Error: errorResponseSchema as Reference,
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          description: 'Simple bearer token',
          scheme: 'bearer',
          bearerFormat: 'simple',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const spec = swaggerJSDoc(options);

export default spec;
