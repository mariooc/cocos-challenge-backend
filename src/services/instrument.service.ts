import { Instrument } from '@/entities/instrument.entity';
import { logger } from '@/utils/logger.utils';

export const fetchInstruments = (q: string) => {
  logger.info(`Searching instruments for ${q}`);
  return Instrument.searchByTicker(q);
};
