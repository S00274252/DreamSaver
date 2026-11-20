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
   /**
   * @openapi
   * /users:
   *   get:
   *     summary: Retrieve all users
   *     tags:
   *       - Users
   *     responses:
   *       200:
   *         description: Successfully retrieved users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       500:
   *         description: Internal server error
   */
  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await userService.getAllUsers());
    } catch (error) {
      handleError(res, error, 'Error fetching users');
    }
  };

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     summary: Get a user by ID
   *     tags:
   *       - Users
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @openapi
   * /users:
   *   post:
   *     summary: Create a new user
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserInput'
   *     responses:
   *       201:
   *         description: User created (the password is stored hashed and never returned)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation failed
   *       409:
   *         description: Email already in use
   *       500:
   *         description: Internal server error
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error, 'Error creating user');
    }
  };

  /**
   * @openapi
   * /users/{id}:
   *   put:
   *     summary: Update a user
   *     tags:
   *       - Users
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserInput'
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation failed
   *       404:
   *         description: User not found
   *       409:
   *         description: Email already in use
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     summary: Delete a user together with their deposits, funds and dreams
   *     tags:
   *       - Users
   *     parameters:
   *       - $ref: '#/components/parameters/IdParam'
   *     responses:
   *       200:
   *         description: User deleted
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
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
}
