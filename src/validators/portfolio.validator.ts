import { creatorValidations } from '@/utils/valitadors.utils';
import { z } from 'zod';

export const FetchPortfolioParamsSchema = z.object({
  userId: creatorValidations.forNumericValue('userId'),
});

export const GetPortfolioSchema = z.object({
  params: FetchPortfolioParamsSchema,
});
