import { Router } from 'express';
import { FundController } from '../controllers/funds';
import { validate } from '../middleware/validate.middleware';
import { createFundZSchema, updateFundZSchema } from '../models/funds';
import { idParamsZSchema, userIdQueryZSchema } from '../models/common';

const router = Router();
const fundController = new FundController();

router.get('/', validate({ query: userIdQueryZSchema }), fundController.getFunds);
router.post('/', validate({ body: createFundZSchema }), fundController.createFund);

router.get('/:id', validate({ params: idParamsZSchema }), fundController.getFundById);
router.put('/:id', validate({ params: idParamsZSchema, body: updateFundZSchema }), fundController.updateFund);
router.delete('/:id', validate({ params: idParamsZSchema }), fundController.deleteFund);

export default router;
