import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserZSchema, loginZSchema } from '../models/users';

const router = Router();
const authController = new AuthController();

router.post('/register', validate({ body: createUserZSchema }), authController.register);
router.post('/login', validate({ body: loginZSchema }), authController.login);
router.get('/me', authenticateJWT, authController.me);

export default router;