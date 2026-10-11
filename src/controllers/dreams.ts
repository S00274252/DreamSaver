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

  /**
   * @openapi
   * /dreams:
   *   get:
   *     summary: Retrieve dreams (optionally only those of one user)
   *     tags:
   *       - Dreams
   *     parameters:
   *       - $ref: '#/components/parameters/UserIdQuery'
   *     responses:
   *       200:
   *         description: Successfully retrieved dreams
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Dream'
   *       400:
   *         description: Invalid userId
   *       500:
   *         description: Internal server error
   */

  getDreams = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await dreamService.getAllDreams(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching dreams');
    }
  };

  /**
   * @openapi
   * /dreams/{id}:
   *   get:
   *     summary: Get a dream by ID
   *     tags:
   *       - Dreams
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Dream found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Dream'
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Dream not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /dreams/{id}/estimate:
   *   get:
   *     summary: Estimate when the dream will come true (data for the countdown timer)
   *     description: >
   *       Finds the first month in which the projected balance reaches the target amount,
   *       using the user's average monthly deposit (or the optional monthlyDeposit override)
   *       and the interest growth of their funds.
   *     tags:
   *       - Dreams
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *       - in: query
   *         name: monthlyDeposit
   *         required: false
   *         schema:
   *           type: number
   *           minimum: 0
   *     responses:
   *       200:
   *         description: Estimate
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DreamEstimate'
   *       400:
   *         description: Invalid ID or query parameters
   *       404:
   *         description: Dream not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /dreams:
   *   post:
   *     summary: Create a dream
   *     tags:
   *       - Dreams
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDreamInput'
   *     responses:
   *       201:
   *         description: Dream created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Dream'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  
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

  /**
   * @openapi
   * /dreams/{id}:
   *   put:
   *     summary: Edit a dream
   *     tags:
   *       - Dreams
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateDreamInput'
   *     responses:
   *       200:
   *         description: Dream updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Dream'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: Dream not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /dreams/{id}:
   *   delete:
   *     summary: Delete a dream
   *     tags:
   *       - Dreams
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Dream deleted
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Dream not found
   *       500:
   *         description: Internal server error
   */

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
