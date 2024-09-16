import { expect, test, describe } from 'vitest';
import { CreateOrderBodySchema } from '@/validators/order.validator';
import { InvestmentType, OrderSide, OrderType } from '@/types/order.types';
import { FIAT_TICKER } from '@/constants/orders.constant';

describe('CreateOrderBodySchema', () => {
  describe('SHARES', () => {
    test('should fail when investmentAmount is not an integer', () => {
      const data = {
        investmentType: InvestmentType.SHARES,
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        ticker: 'METR',
        investmentAmount: 1.5,
        userId: 1,
      };

      const result = CreateOrderBodySchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Must be an integer when investmentType is SHARES'
      );
    });
  });

  test('should fail when ticker is ARS', () => {
    const data = {
      investmentType: InvestmentType.SHARES,
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
      ticker: FIAT_TICKER,
      investmentAmount: 100,
      userId: 1,
    };

    const result = CreateOrderBodySchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      'Ticket ARS is reserved for FIAT'
    );
  });

  test('should validate valid data', () => {
    const data = {
      investmentType: InvestmentType.SHARES,
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
      investmentAmount: 100,
      ticker: 'METR',
      userId: 1,
    };

    const result = CreateOrderBodySchema.safeParse(data);

    expect(result.success).toBe(true);
  });
});
