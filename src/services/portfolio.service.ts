import { UserSummary } from '@/entities/userSummary.entity';
import { mapToPortfolio } from '@/mappers/portfolio.mapper';
import { logger } from '@/utils/logger.utils';

export const fetchUserPortfolio = async (userId: number) => {
  logger.info(`Fetching portfolio for user ${userId}`);

  const instruments = await UserSummary.getPorfolio(userId);

  const mapped = instruments.map((instrument) => mapToPortfolio(instrument));
  return mapped;
};
