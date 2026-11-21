import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

interface RequestSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

export const validate =
  (schemas: RequestSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: { source: string; path: PropertyKey[]; message: string }[] = [];

    for (const source of ['params', 'query', 'body'] as const) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ source, path: issue.path, message: issue.message });
        }
      } else if (source === 'body') {
        req.body = result.data;
      } else if (source === 'query') {
        res.locals.query = result.data;
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }
    next();
  };