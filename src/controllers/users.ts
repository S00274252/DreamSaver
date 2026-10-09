import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/users';
import { FinanceService } from '../services/finance';
import { handleError } from '../utils/errors';
import { getParam } from '../utils/params';

const userService = new UserService();
const financeService = new FinanceService();

const predictionQuerySchema = z.object({
  date: z.coerce.date(),
  monthlyDeposit: z.coerce.number().min(0).optional(),
});

export class UserController {
  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await userService.getAllUsers());
    } catch (error) {
      handleError(res, error, 'Error fetching users');
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.getUserById(getParam(req, 'id'));
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      handleError(res, error, 'Error fetching user');
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error, 'Error creating user');
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.updateUser(getParam(req, 'id'), req.body);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      handleError(res, error, 'Error updating user');
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.deleteUser(getParam(req, 'id'));
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      handleError(res, error, 'Error deleting user');
    }
  };

  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getParam(req, 'id');
      if (!(await userService.userExists(id))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(await financeService.getBalance(id));
    } catch (error) {
      handleError(res, error, 'Error calculating balance');
    }
  };

  getPrediction = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = predictionQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ message: 'Invalid query parameters', errors: query.error.issues });
        return;
      }

      const id = getParam(req, 'id');
      if (!(await userService.userExists(id))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json(await financeService.getPrediction(id, query.data.date, query.data.monthlyDeposit));
    } catch (error) {
      handleError(res, error, 'Error predicting balance');
    }
  };
}
