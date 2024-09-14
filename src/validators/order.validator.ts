import { FIAT_TICKER } from '@/constants/orders.constant';
import { InvestmentType, OrderSide, OrderType } from '@/types/order.types';
import { z } from 'zod';

export const CreateOrderBodySchema = z
  .object({
    investmentType: z.nativeEnum(InvestmentType),
    investmentAmount: z.number().min(1),
    ticker: z
      .string()
      .min(2)
      .refine((ticker) => ticker !== FIAT_TICKER, {
        message: `Ticket ${FIAT_TICKER} is reserved for FIAT`,
      }),
    side: z.enum([OrderSide.BUY, OrderSide.SELL]),
    type: z.nativeEnum(OrderType),
    userId: z.number().min(1).int(),
  })
  .refine(
    (data) => {
      if (data.investmentType === InvestmentType.SHARES) {
        return Number.isInteger(data.investmentAmount);
      }
      return true;
    },
    {
      path: ['investmentAmount'],
      message: 'Must be an integer when investmentType is SHARES',
    }
  );

export const PostOrderSchema = z.object({
  body: CreateOrderBodySchema,
});
