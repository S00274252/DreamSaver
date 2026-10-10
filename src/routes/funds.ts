import { Router } from 'express';
import { FundController } from '../controllers/funds';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId, validateUserIdQuery } from '../middleware/validate.middleware';
import { createFundZSchema, updateFundZSchema } from '../models/funds';

const router = Router();
const fundController = new FundController();

router.get('/', validateUserIdQuery, fundController.getFunds);
router.post('/', validate(createFundZSchema), fundController.createFund);

router.get('/:id', validateObjectId(), fundController.getFundById);
router.put('/:id', validateObjectId(), validate(updateFundZSchema), fundController.updateFund);
router.delete('/:id', validateObjectId(), fundController.deleteFund);

export default router;
