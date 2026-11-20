import { Router } from 'express';
import { FinanceController } from '../controllers/finance';
import { validate } from '../middleware/validate.middleware';
import { balanceQueryZSchema, predictionQueryZSchema } from '../models/finance';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const financeController = new FinanceController();

router.get('/balance', authenticateJWT, validate({ query: balanceQueryZSchema }), financeController.getBalance);
router.get('/predictions',authenticateJWT, validate({ query: predictionQueryZSchema }), financeController.getPrediction);

export default router;