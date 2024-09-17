export type Portfolio = {
  ticker: string;
  instrumentId: number;
  name: string;
  quantity: number;
  price: number;
  profit: number;
  total: number;
};

export type Summary = {
  instrumentId: number;
  totalSize: number;
  name: string;
  ticker: string;
  close: number;
  previousClose: number;
};
