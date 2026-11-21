import { Request, Response } from 'express';
import { FinanceService } from '../services/finance';
import { UserService } from '../services/users';
import { BalanceQuery, PredictionQuery } from '../models/finance';
import { handleError } from '../utils/errors';

const financeService = new FinanceService();
const userService = new UserService();

export class FinanceController {
    /**
   * @openapi
   * /balance:
   *   get:
   *     summary: Get the user's total balance with a full breakdown
   *     description: Deposits + static funds + interest funds (including interest earned so far).
   *     tags:
   *       - Balance
   *     parameters:
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Balance breakdown
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 asOf:
   *                   type: string
   *                   format: date-time
   *                 depositsTotal:
   *                   type: number
   *                 staticFundsTotal:
   *                   type: number
   *                 interestFundsPrincipal:
   *                   type: number
   *                 interestEarned:
   *                   type: number
   *                 interestFundsTotal:
   *                   type: number
   *                 totalBalance:
   *                   type: number
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  getBalance = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = res.locals.query as BalanceQuery;
      if (!(await userService.userExists(userId))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(await financeService.getBalance(userId));
    } catch (error) {
      handleError(res, error, 'Error calculating balance');
    }
  };

     /**
   * @openapi
   * /predictions:
   *   get:
   *     summary: Predict the user's balance on a future date
   *     description: >
   *       Uses the average monthly deposit (or the optional monthlyDeposit override)
   *       and the interest growth of the user's funds.
   *     tags:
   *       - Balance
   *     parameters:
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         example: 2027-12-31
   *       - in: query
   *         name: monthlyDeposit
   *         required: false
   *         schema:
   *           type: number
   *           minimum: 0
   *     responses:
   *       200:
   *         description: Predicted balance
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 asOf:
   *                   type: string
   *                   format: date-time
   *                 predictionDate:
   *                   type: string
   *                   format: date-time
   *                 monthlyDeposit:
   *                   type: number
   *                 currentBalance:
   *                   type: number
   *                 predictedBalance:
   *                   type: number
   *                 expectedGrowth:
   *                   type: number
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */

  getPrediction = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { userId, date, monthlyDeposit } = res.locals.query as PredictionQuery;
      if (!(await userService.userExists(userId))) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(await financeService.getPrediction(userId, date, monthlyDeposit));
    } catch (error) {
      handleError(res, error, 'Error predicting balance');
    }
  };
}