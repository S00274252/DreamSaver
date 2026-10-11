import { Request, Response } from 'express';
import { DepositService } from '../services/deposits';
import { UserService } from '../services/users';
import { handleError } from '../utils/errors';
import { getParam, getUserIdQuery } from '../utils/params';

const depositService = new DepositService();
const userService = new UserService();

export class DepositController {

  /**
   * @openapi
   * /deposits:
   *   get:
   *     summary: Retrieve deposits (optionally only those of one user)
   *     tags:
   *       - Deposits
   *     parameters:
   *       - $ref: '#/components/parameters/UserIdQuery'
   *     responses:
   *       200:
   *         description: Successfully retrieved deposits
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Deposit'
   *       400:
   *         description: Invalid userId
   *       500:
   *         description: Internal server error
   */

  getDeposits = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await depositService.getAllDeposits(getUserIdQuery(req)));
    } catch (error) {
      handleError(res, error, 'Error fetching deposits');
    }
  };

  /**
   * @openapi
   * /deposits/{id}:
   *   get:
   *     summary: Get a deposit by ID
   *     tags:
   *       - Deposits
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Deposit found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Deposit'
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Deposit not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /deposits:
   *   post:
   *     summary: Add a deposit (it is automatically included in the balance)
   *     tags:
   *       - Deposits
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDepositInput'
   *     responses:
   *       201:
   *         description: Deposit created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Deposit'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /deposits/{id}:
   *   put:
   *     summary: Edit a deposit
   *     tags:
   *       - Deposits
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateDepositInput'
   *     responses:
   *       200:
   *         description: Deposit updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Deposit'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: Deposit not found
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /deposits/{id}:
   *   delete:
   *     summary: Delete a deposit
   *     tags:
   *       - Deposits
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: Deposit deleted
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Deposit not found
   *       500:
   *         description: Internal server error
   */

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
