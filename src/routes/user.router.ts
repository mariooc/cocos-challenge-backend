import { Router } from 'express';
import { validateRequest } from '@/utils/request.utils';
import { getPortfolio } from '@/controllers/portfolio.controller';
import { GetPortfolioSchema } from '@/validators/portfolio.validator';
const router = Router();

router.get(
  '/:userId/portfolio',
  validateRequest(GetPortfolioSchema),
  getPortfolio
);

export default router;
