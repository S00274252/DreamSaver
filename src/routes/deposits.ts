import { Router } from 'express';
import { DepositController } from '../controllers/deposits';
import { validate } from '../middleware/validate.middleware';
import { idParamsZSchema, userIdQueryZSchema } from '../models/common';
import { createDepositZSchema, updateDepositZSchema } from '../models/deposits';

const router = Router();
const depositController = new DepositController();

router.get('/', validate({ query: userIdQueryZSchema }), depositController.getDeposits);
router.post('/', validate({ body: createDepositZSchema }), depositController.createDeposit);

router.get('/:id', validate({ params: idParamsZSchema }), depositController.getDepositById);
router.put('/:id', validate({ params: idParamsZSchema, body: updateDepositZSchema }), depositController.updateDeposit);
router.delete('/:id', validate({ params: idParamsZSchema }), depositController.deleteDeposit);
export default router;
