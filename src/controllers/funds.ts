import { Request, Response } from 'express';
import { FundService } from '../services/funds';
import { UserService } from '../services/users';
import { createFundZSchema } from '../models/funds';
import { handleError } from '../utils/errors';
import { getParam, getUserIdQuery } from '../utils/params';

const fundService = new FundService();
const userService = new UserService();

export class FundController {
  /**
   * @openapi
   * /funds:
   *   get:
   *     summary: Retrieve funds (optionally only those of one user)
   *     tags:
   *       - Funds
   *     parameters:
   *       - $ref: '#/components/parameters/UserIdQuery'
   *     responses:
   *       200:
   *         description: Successfully retrieved funds
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Fund'
   *       400:
   *         description: Invalid userId
   *       500:
   *         description: Internal server error
   */
  getFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await fundService.getAllFunds(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching funds');
    }
  };

  /**
   * @openapi
   * /funds/{id}:
   *   get:
   *     summary: Get a fund by ID
   *     tags:
   *       - Funds
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Fund found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Fund'
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Fund not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @openapi
   * /funds:
   *   post:
   *     summary: Add a static fund (no interest) or an interest-bearing fund
   *     tags:
   *       - Funds
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFundInput'
   *     responses:
   *       201:
   *         description: Fund created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Fund'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @openapi
   * /funds/{id}:
   *   put:
   *     summary: Edit a fund
   *     tags:
   *       - Funds
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateFundInput'
   *     responses:
   *       200:
   *         description: Fund updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Fund'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: Fund not found
   *       500:
   *         description: Internal server error
   */
  updateFund = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getParam(req, 'id');
      const existing = await fundService.getFundById(id);
      if (!existing) {
        res.status(404).json({ message: 'Fund not found' });
        return;
      }

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

  /**
   * @openapi
   * /funds/{id}:
   *   delete:
   *     summary: Delete a fund
   *     tags:
   *       - Funds
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Fund deleted
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Fund not found
   *       500:
   *         description: Internal server error
   */
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
