import { Router } from 'express';
import { UserController } from '../controllers/users';
import { validate } from '../middleware/validate.middleware';
import { createUserZSchema, updateUserZSchema } from '../models/users';
import { idParamsZSchema } from '../models/common';

const router = Router();
const userController = new UserController();

// router.get('/', userController.getUsers);
// router.post('/', validate({ body: createUserZSchema }), userController.createUser);

router.get('/:id', validate({ params: idParamsZSchema }), userController.getUserById);
router.put('/:id', validate({ params: idParamsZSchema, body: updateUserZSchema }), userController.updateUser);
router.delete('/:id', validate({ params: idParamsZSchema }), userController.deleteUser);

export default router;
