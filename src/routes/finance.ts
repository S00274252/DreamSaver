import { Router } from 'express';
import { FinanceController } from '../controllers/finance';
import { validate } from '../middleware/validate.middleware';
import { balanceQueryZSchema, predictionQueryZSchema } from '../models/finance';

const router = Router();
const financeController = new FinanceController();

router.get('/balance', validate({ query: balanceQueryZSchema }), financeController.getBalance);
router.get('/predictions', validate({ query: predictionQueryZSchema }), financeController.getPrediction);

export default router;