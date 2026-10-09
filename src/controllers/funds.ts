import { Request, Response } from 'express';
import { FundService } from '../services/funds';
import { UserService } from '../services/users';
import { createFundZSchema } from '../models/funds';
import { handleError } from '../utils/errors';
import { getParam, getUserIdQuery } from '../utils/params';

const fundService = new FundService();
const userService = new UserService();

export class FundController {
  getFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await fundService.getAllFunds(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching funds');
    }
  };

  getFundById = async (req: Request, res: Response): Promise<void> => {
    try {
      const fund = await fundService.getFundById(getParam(req, 'id'));
      if (!fund) {
        res.status(404).json({ message: 'Fund not found' });
        return;
      }
      res.status(200).json(fund);
    } catch (error) {
      handleError(res, error, 'Error fetching fund');
    }
  };


  createFund = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!(await userService.userExists(req.body.userId))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(201).json(await fundService.createFund(req.body));
    } catch (error) {
      handleError(res, error, 'Error creating fund');
    }
  };

  updateFund = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getParam(req, 'id');
      const existing = await fundService.getFundById(id);
      if (!existing) {
        res.status(404).json({ message: 'Fund not found' });
        return;
      }

      // The merged result must still be a valid fund (e.g. an interest fund keeps its rate, start date and duration)
      const merged = createFundZSchema.safeParse({
        ...existing,
        userId: String(existing.userId),
        ...req.body,
      });
      if (!merged.success) {
        res.status(400).json({ message: 'Validation failed', errors: merged.error.issues });
        return;
      }

      res.status(200).json(await fundService.updateFund(id, req.body));
    } catch (error) {
      handleError(res, error, 'Error updating fund');
    }
  };

  deleteFund = async (req: Request, res: Response): Promise<void> => {
    try {
      const fund = await fundService.deleteFund(getParam(req, 'id'));
      if (!fund) {
        res.status(404).json({ message: 'Fund not found' });
        return;
      }
      res.status(200).json(fund);
    } catch (error) {
      handleError(res, error, 'Error deleting fund');
    }
  };
}
