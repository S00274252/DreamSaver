import { Router } from 'express';
import { UserController } from '../controllers/users';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId } from '../middleware/validate.middleware';
import { createUserZSchema, updateUserZSchema } from '../models/users';

const router = Router();
const userController = new UserController();

router.get('/', userController.getUsers);
router.post('/', validate(createUserZSchema), userController.createUser);

router.get('/:id', validateObjectId(), userController.getUserById);
router.put('/:id', validateObjectId(), validate(updateUserZSchema), userController.updateUser);
router.delete('/:id', validateObjectId(), userController.deleteUser);

router.get('/:id/balance', validateObjectId(), userController.getBalance);
router.get('/:id/prediction', validateObjectId(), userController.getPrediction);

export default router;
