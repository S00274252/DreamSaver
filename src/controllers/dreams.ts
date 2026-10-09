import { Request, Response } from 'express';
import { z } from 'zod';
import { DreamService } from '../services/dreams';
import { FinanceService } from '../services/finance';
import { UserService } from '../services/users';
import { handleError } from '../utils/errors';
import { getParam, getUserIdQuery } from '../utils/params';

const dreamService = new DreamService();
const financeService = new FinanceService();
const userService = new UserService();

const estimateQuerySchema = z.object({
  monthlyDeposit: z.coerce.number().min(0).optional(),
});

export class DreamController {

  getDreams = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await dreamService.getAllDreams(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching dreams');
    }
  };

  getDreamById = async (req: Request, res: Response): Promise<void> => {
    try {
      const dream = await dreamService.getDreamById(getParam(req, 'id'));
      if (!dream) {
        res.status(404).json({ message: 'Dream not found' });
        return;
      }
      res.status(200).json(dream);
    } catch (error) {
      handleError(res, error, 'Error fetching dream');
    }
  };

  getDreamEstimate = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = estimateQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ message: 'Invalid query parameters', errors: query.error.issues });
        return;
      }

      const dream = await dreamService.getDreamById(getParam(req, 'id'));
      if (!dream) {
        res.status(404).json({ message: 'Dream not found' });
        return;
      }

      const estimate = await financeService.getDreamEstimate(
        String(dream.userId),
        dream.targetAmount,
        query.data.monthlyDeposit
      );
      res.status(200).json(estimate);
    } catch (error) {
      handleError(res, error, 'Error estimating dream');
    }
  };

  
  createDream = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!(await userService.userExists(req.body.userId))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(201).json(await dreamService.createDream(req.body));
    } catch (error) {
      handleError(res, error, 'Error creating dream');
    }
  };

  updateDream = async (req: Request, res: Response): Promise<void> => {
    try {
      const dream = await dreamService.updateDream(getParam(req, 'id'), req.body);
      if (!dream) {
        res.status(404).json({ message: 'Dream not found' });
        return;
      }
      res.status(200).json(dream);
    } catch (error) {
      handleError(res, error, 'Error updating dream');
    }
  };

  deleteDream = async (req: Request, res: Response): Promise<void> => {
    try {
      const dream = await dreamService.deleteDream(getParam(req, 'id'));
      if (!dream) {
        res.status(404).json({ message: 'Dream not found' });
        return;
      }
      res.status(200).json(dream);
    } catch (error) {
      handleError(res, error, 'Error deleting dream');
    }
  };
}
