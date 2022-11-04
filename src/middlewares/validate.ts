import { NextFunction, Request, Response } from 'express';
import { Validator } from 'jsonschema';
import validator from 'validator';
import capitalize from '../utils/capitalize';

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
      const errors: { [key: string]: string } = {};
      v.errors.forEach(err => {
        if (err.path.length > 0) {
          errors[err.path[0]] = capitalize(err.message);
        }
      });
      res.status(400).json({
        errors,
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
