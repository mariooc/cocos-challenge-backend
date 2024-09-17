import { Portfolio, Summary } from '@/types/portfolio.types';

export const mapToPortfolio = (instrument: Summary) => {
  // get percentage profit
  const { close, previousClose } = instrument;

  const profit = (100 * (close - previousClose)) / close;

  const item: Portfolio = {
    instrumentId: instrument.instrumentId,
    ticker: instrument.ticker,
    name: instrument.name,
    quantity: +instrument.totalSize,
    price: +instrument.close,
    total: +instrument.close * instrument.totalSize,
    profit,
  };

  return item;
};
