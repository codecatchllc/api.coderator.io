import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import spec from '../openapi';
import urls from '../urls';
import authRouter from './auth';
import postRouter from './post';

const router = Router();

// Swagger API docs
const swaggerSpecPath = `${urls.swagger.path}/${urls.swagger.spec}`;
const swaggerUIOptions = {
  swaggerOptions: {
    url: swaggerSpecPath,
  },
};
router.get(swaggerSpecPath, (_, res) => res.json(spec));
router.use(
  urls.swagger.path,
  swaggerUi.serve,
  swaggerUi.setup(spec, swaggerUIOptions)
);

router.use(urls.apiPrefix + urls.auth.path, authRouter);

// CRUD API
router.use(urls.apiPrefix, postRouter);

// Redirect browsers from index to API docs
router.get('/', (req, res, next) => {
  if (req.accepts('text/html')) {
    res.redirect(urls.swagger.path);
  } else {
    next();
  }
});

export default router;
