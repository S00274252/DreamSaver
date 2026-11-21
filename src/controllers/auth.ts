import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { handleError } from '../utils/errors';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      res.status(201).json(await authService.register(name, email, password));
    } catch (error) {
      handleError(res, error, 'Error registering user');
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      res.status(200).json({ token: await authService.login(email, password) });
    } catch (error) {
      handleError(res, error, 'Error logging in');
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await authService.getUserById(req.user!.sub));
    } catch (error) {
      handleError(res, error, 'Error fetching the logged-in user');
    }
  };
}