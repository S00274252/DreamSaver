import { Request, Response } from 'express';
import { DepositService } from '../services/deposits';
import { UserService } from '../services/users';
import { handleError } from '../utils/errors';
import { getParam, getUserIdQuery } from '../utils/params';

const depositService = new DepositService();
const userService = new UserService();

export class DepositController {
  getDeposits = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await depositService.getAllDeposits(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching deposits');
    }
  };

  getDepositById = async (req: Request, res: Response): Promise<void> => {
    try {
      const deposit = await depositService.getDepositById(getParam(req, 'id'));
      if (!deposit) {
        res.status(404).json({ message: 'Deposit not found' });
        return;
      }
      res.status(200).json(deposit);
    } catch (error) {
      handleError(res, error, 'Error fetching deposit');
    }
  };

  createDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!(await userService.userExists(req.body.userId))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(201).json(await depositService.createDeposit(req.body));
    } catch (error) {
      handleError(res, error, 'Error creating deposit');
    }
  };

  updateDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const deposit = await depositService.updateDeposit(getParam(req, 'id'), req.body);
      if (!deposit) {
        res.status(404).json({ message: 'Deposit not found' });
        return;
      }
      res.status(200).json(deposit);
    } catch (error) {
      handleError(res, error, 'Error updating deposit');
    }
  };

  deleteDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const deposit = await depositService.deleteDeposit(getParam(req, 'id'));
      if (!deposit) {
        res.status(404).json({ message: 'Deposit not found' });
        return;
      }
      res.status(200).json(deposit);
    } catch (error) {
      handleError(res, error, 'Error deleting deposit');
    }
  };
}
