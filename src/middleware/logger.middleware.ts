import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = async (req : Request, _res : Response, next : NextFunction): Promise<void> => {
    console.log(`${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
    next();
};
