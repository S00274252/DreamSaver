import { Router } from 'express';
import { DepositController } from '../controllers/deposits';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId, validateUserIdQuery } from '../middleware/validate.middleware';
import { createDepositZSchema, updateDepositZSchema } from '../models/deposits';

const router = Router();
const depositController = new DepositController();

router.get('/', validateUserIdQuery, depositController.getDeposits);
router.post('/', validate(createDepositZSchema), depositController.createDeposit);

router.get('/:id', validateObjectId(), depositController.getDepositById);
router.put('/:id', validateObjectId(), validate(updateDepositZSchema), depositController.updateDeposit);
router.delete('/:id', validateObjectId(), depositController.deleteDeposit);

export default router;
