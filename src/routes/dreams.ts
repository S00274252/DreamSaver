import { Router } from 'express';
import { DreamController } from '../controllers/dreams';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId, validateUserIdQuery } from '../middleware/validate.middleware';
import { createDreamZSchema, updateDreamZSchema } from '../models/dreams';

const router = Router();
const dreamController = new DreamController();

router.get('/', validateUserIdQuery, dreamController.getDreams);
router.post('/', validate(createDreamZSchema), dreamController.createDream);

router.get('/:id', validateObjectId(), dreamController.getDreamById);
router.get('/:id/estimate', validateObjectId(), dreamController.getDreamEstimate);
router.put('/:id', validateObjectId(), validate(updateDreamZSchema), dreamController.updateDream);
router.delete('/:id', validateObjectId(), dreamController.deleteDream);

export default router;
