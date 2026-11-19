import { Router } from 'express';
import { DreamController } from '../controllers/dreams';
import { validate } from '../middleware/validate.middleware';
import { createDreamZSchema, updateDreamZSchema } from '../models/dreams';
import { idParamsZSchema, userIdQueryZSchema } from '../models/common';

const router = Router();
const dreamController = new DreamController();

router.get('/', validate({ query: userIdQueryZSchema }), dreamController.getDreams);
router.post('/', validate({ body: createDreamZSchema }), dreamController.createDream);

router.get('/:id', validate({ params: idParamsZSchema }), dreamController.getDreamById);
router.get('/:id/estimate', validate({ params: idParamsZSchema }), dreamController.getDreamEstimate);
router.put('/:id', validate({ params: idParamsZSchema, body: updateDreamZSchema }), dreamController.updateDream);
router.delete('/:id', validate({ params: idParamsZSchema }), dreamController.deleteDream);

export default router;
