import { UserSummary } from '@/entities/userSummary.entity';
import { logger } from '@/utils/logger.utils';

export const fetchUserPortfolio = async (userId: number) => {
  logger.info(`Fetching portfolio for user ${userId}`);
  const portfolio = await UserSummary.getPorfolio(userId);

  // TODO: calcular profit
  return portfolio;
};
