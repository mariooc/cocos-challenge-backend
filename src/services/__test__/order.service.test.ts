import { vi, expect, test, describe } from 'vitest';
import { dataSource } from '@/entities/dataSource';

import { createOrder } from '@/services/order.service';
import {
  CreateOrderInput,
  InvestmentType,
  OrderSide,
  OrderStatus,
  OrderType,
} from '@/types/order.types';
import { MarketData } from '@/entities/marketData.entity';
import { User } from '@/entities/user.entity';
import { UserSummary } from '@/entities/userSummary.entity';
import { BaseEntity, EntityManager } from 'typeorm';
import {
  mockARSInstrument,
  mockInstrument,
  mockMarketData,
  mockUser,
  mockUserSummary,
  TICKER,
  validInput,
} from './order.service.mock';
import { Instrument } from '@/entities/instrument.entity';

const entityManagerMock: Partial<EntityManager> = {
  save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
  findOne: vi.fn().mockResolvedValue(null),
};

vi.mock('@/entities/dataSource', () => ({
  dataSource: {
    initialize: vi.fn().mockResolvedValue(true),
    manager: {
      // Mock de transaction para simular la llamada al callback
      transaction: vi.fn((callback) => {
        return callback(entityManagerMock); // Pasa el entityManagerMock al callback de transaction
      }),
    },
  },
}));

beforeAll(async () => {
  await dataSource.initialize();
  BaseEntity.useDataSource(dataSource);
});

describe('createOrder', () => {
  test('should throw an error when user not found', async () => {
    vi.spyOn(User, 'getUser').mockResolvedValue(null);

    const input = {
      ...validInput,
      userId: 1000,
    };

    await expect(createOrder(input)).rejects.toThrow('User 1000 not found');
  });

  test('should throw an error when marketData not found', async () => {
    vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue(null);
    vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);

    const input = {
      ...validInput,
      ticker: 'YYYY',
    };

    await expect(createOrder(input)).rejects.toThrow(
      'MarketData not found for instrument YYYY'
    );
  });

  test('should throw an error when is a SELL order and user has no the instrument', async () => {
    vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue(mockMarketData);
    vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(null);

    const ticker = TICKER;
    const input: CreateOrderInput = {
      ...validInput,
      ticker,
      side: OrderSide.SELL,
    };

    await expect(createOrder(input)).rejects.toThrow(
      `UserSummary not found for instrument ${ticker}`
    );
  });

  test('should throw an error when size is not integer for investmentType SHARES', async () => {
    vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue(mockMarketData);
    vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
      mockUserSummary
    );

    const input: CreateOrderInput = {
      ...validInput,
      side: OrderSide.SELL,
      investmentType: InvestmentType.SHARES,
      investmentAmount: 1.1,
    };

    await expect(createOrder(input)).rejects.toThrow(
      `No allow integers for investmentAmount ${input.investmentAmount}`
    );
  });
  test('should throw an error when size is not integer for investmentType FIAT', async () => {
    vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue(mockMarketData);
    vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
      mockUserSummary
    );

    const input: CreateOrderInput = {
      ...validInput,
      side: OrderSide.SELL,
      investmentType: InvestmentType.FIAT,
      investmentAmount: 1.1,
    };

    const size = input.investmentAmount / mockMarketData.close;

    await expect(createOrder(input)).rejects.toThrow(
      `No allow integers for investmentAmount ${size}`
    );
  });

  describe('BUY Order > SHARES', () => {
    test('should throw an error when investmentAmount * currentPrice is greater than ARS', async () => {
      vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
        ...mockMarketData,
        close: 100.5,
      } as MarketData);
      vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
      vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
        mockUserSummary
      );
      vi.spyOn(UserSummary, 'getARS').mockResolvedValue(100);
      vi.spyOn(Instrument, 'getByTicker')
        .mockResolvedValueOnce(mockInstrument)
        .mockResolvedValueOnce(mockARSInstrument);

      const input: CreateOrderInput = {
        ...validInput,
        side: OrderSide.BUY,
        investmentType: InvestmentType.SHARES,
        investmentAmount: 100,
      };

      await expect(createOrder(input)).resolves.toHaveProperty(
        'status',
        OrderStatus.REJECTED
      );
    });
  });

  describe('Create Order', () => {
    describe('MARKET', () => {
      test('should create a new order type MARKET with SHARES', async () => {
        vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
          ...mockMarketData,
          close: 100.5,
        } as MarketData);
        vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
        vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
          mockUserSummary
        );
        vi.spyOn(UserSummary, 'getARS').mockResolvedValue(1000);
        vi.spyOn(Instrument, 'getByTicker')
          .mockResolvedValueOnce(mockInstrument)
          .mockResolvedValueOnce(mockARSInstrument);

        const input: CreateOrderInput = {
          ...validInput,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          investmentType: InvestmentType.SHARES,
          investmentAmount: 1,
        };

        const order = await createOrder(input);

        expect(order).toHaveProperty('type', OrderType.MARKET);
        expect(order).toHaveProperty('status', OrderStatus.FILLED);
      });

      test('should create a new order type MARKET with FIAT', async () => {
        vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
          ...mockMarketData,
          close: 100,
        } as MarketData);
        vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
        vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
          mockUserSummary
        );
        vi.spyOn(UserSummary, 'getARS').mockResolvedValue(1000);
        vi.spyOn(Instrument, 'getByTicker')
          .mockResolvedValueOnce(mockInstrument)
          .mockResolvedValueOnce(mockARSInstrument);

        const input: CreateOrderInput = {
          ...validInput,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          investmentType: InvestmentType.FIAT,
          investmentAmount: 100,
        };

        const order = await createOrder(input);

        expect(order).toHaveProperty('type', OrderType.MARKET);
        expect(order).toHaveProperty('status', OrderStatus.FILLED);
      });
    });

    describe('LIMIT', () => {
      test('should create a new order type LIMIT with SHARES', async () => {
        vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
          ...mockMarketData,
          close: 100.5,
        } as MarketData);
        vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
        vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
          mockUserSummary
        );
        vi.spyOn(UserSummary, 'getARS').mockResolvedValue(1000);
        vi.spyOn(Instrument, 'getByTicker')
          .mockResolvedValueOnce(mockInstrument)
          .mockResolvedValueOnce(mockARSInstrument);

        const input: CreateOrderInput = {
          ...validInput,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
          investmentType: InvestmentType.SHARES,
          investmentAmount: 1,
        };

        const order = await createOrder(input);

        expect(order).toHaveProperty('type', OrderType.LIMIT);
        expect(order).toHaveProperty('status', OrderStatus.NEW);
      });

      test('should create a new order type LIMIT with FIAT', async () => {
        vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
          ...mockMarketData,
          close: 100,
        } as MarketData);
        vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
        vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
          mockUserSummary
        );
        vi.spyOn(UserSummary, 'getARS').mockResolvedValue(1000);
        vi.spyOn(Instrument, 'getByTicker')
          .mockResolvedValueOnce(mockInstrument)
          .mockResolvedValueOnce(mockARSInstrument);

        const input: CreateOrderInput = {
          ...validInput,
          side: OrderSide.BUY,
          type: OrderType.LIMIT,
          investmentType: InvestmentType.FIAT,
          investmentAmount: 100,
        };

        const order = await createOrder(input);

        expect(order).toHaveProperty('type', OrderType.LIMIT);
        expect(order).toHaveProperty('status', OrderStatus.NEW);
      });
    });
  });
});
