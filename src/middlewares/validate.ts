import { NextFunction, Request, Response } from 'express';
import { Validator } from 'jsonschema';
import validator from 'validator';

const defaultOptions = {
  required: true,
};

const jsValidator = new Validator();

export const requireSchema = (schema: object, options = {}) => {
  const validatorOptions: object = { ...defaultOptions, ...options };

  const validatorFunc = (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    if (!body) {
      res.status(400).json({ error: 'Missing request body' });
      return;
    }

    const v = jsValidator.validate(body, schema, validatorOptions);
    if (!v.valid) {
      res.status(400).json({
        error: 'Request body validation failed',
        details: v.errors.map(err => `${err.property}: ${err.message}`),
      });
      return;
    }

    req.validatedBody = v.instance;
    next();
  };

  return validatorFunc;
};

export const requireValidId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validator.isInt(req.params.id, { min: 1 })) {
    res.status(400).json({ error: 'URL does not contain a valid object ID' });
    return;
  }
  next();
};
