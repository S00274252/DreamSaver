import { Request } from 'express';

export const getParam = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
};

export const getUserIdQuery = (req: Request): string | undefined =>
  typeof req.query.userId === 'string' ? req.query.userId : undefined;
