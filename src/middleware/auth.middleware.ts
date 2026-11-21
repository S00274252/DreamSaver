import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const authService = new AuthService();

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    req.user = authService.verifyToken(authHeader.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};