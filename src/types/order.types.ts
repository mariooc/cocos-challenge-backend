import { z } from 'zod';

import { CreateOrderBodySchema } from '@/validators/order.validator';

export enum OrderStatus {
  FILLED = 'FILLED',
  NEW = 'NEW',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}
export enum OrderSide {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum InvestmentType {
  SHARES = 'SHARES',
  FIAT = 'FIAT',
}

export type CreateOrderInput = z.infer<typeof CreateOrderBodySchema>;
