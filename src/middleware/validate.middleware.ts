import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { objectIdRegex } from '../models/common';

export const validate = (schema: z.ZodObject<any>)   => (
  req: Request,
res: Response,
  next: NextFunction
) : void => {

  const validation = schema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: validation.error.issues
    });
    return;
  }

  req.body = validation.data

  next();
};

export const validateObjectId =
  (...names: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const params = names.length > 0 ? names : ['id'];

    for (const name of params) {
      const value = req.params[name];
      if (typeof value !== 'string' || !objectIdRegex.test(value)) {
        res.status(400).json({ message: `Invalid ${name}` });
        return;
      }
    }
    next();
  };

  export const validateUserIdQuery = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.query.userId;
  if (userId !== undefined && (typeof userId !== 'string' || !objectIdRegex.test(userId))) {
    res.status(400).json({ message: 'Invalid userId' });
    return;
  }
  next();
};
