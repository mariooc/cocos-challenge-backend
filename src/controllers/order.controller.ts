import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { extractData } from '@/utils/request.utils';
import { PostOrderSchema } from '@/validators/order.validator';
import { createOrder } from '@/services/order.service';
import { logger } from '@/utils/logger.utils';
import { BusinessError } from '@/errors';

export const postPortfolio = async (req: Request, res: Response) => {
  const { body } = extractData(req, PostOrderSchema);

  try {
    const order = await createOrder(body);
    res.status(StatusCodes.CREATED).json(order);
  } catch (error) {
    logger.error(error);
    if (error instanceof BusinessError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.message });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Internal server error' });
    }
  }
};
