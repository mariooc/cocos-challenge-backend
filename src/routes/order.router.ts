import { Router } from 'express';
import { validateRequest } from '@/utils/request.utils';
import { postPortfolio } from '@/controllers/order.controller';
import { PostOrderSchema } from '@/validators/order.validator';
const router = Router();

router.post('/', validateRequest(PostOrderSchema), postPortfolio);

export default router;
