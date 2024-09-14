import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchUserPortfolio } from '@/services/portfolio.service';
import { extractData } from '@/utils/request.utils';
import { GetPortfolioSchema } from '@/validators/portfolio.validator';

export const getPortfolio = async (req: Request, res: Response) => {
  const { params } = extractData(req, GetPortfolioSchema);
  const { userId } = params;
  const portfolio = await fetchUserPortfolio(userId);
  res.status(StatusCodes.OK).json(portfolio);
};
