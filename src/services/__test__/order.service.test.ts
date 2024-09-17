import { vi, expect, test, describe } from 'vitest';
import { dataSource } from '@/entities/dataSource';

import { createOrder } from '@/services/order.service';
import {
  CreateOrderInput,
  OrderSide,
} from '@/types/order.types';
import { MarketData } from '@/entities/marketData.entity';
import { User } from '@/entities/user.entity';
import { UserSummary } from '@/entities/userSummary.entity';
import { BaseEntity, EntityManager } from 'typeorm';
import { mockMarketData, mockUser, validInput } from './order.service.mock';

const entityManagerMock: Partial<EntityManager> = {
  save: vi.fn().mockResolvedValue(true),
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
    // manager: {
    //   transaction: vi.fn((callback) => callback(entityManagerMock)),
    // },
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

    const ticker = 'METR';
    const input: CreateOrderInput = {
      ...validInput,
      ticker,
      side: OrderSide.SELL,
    };

    await expect(createOrder(input)).rejects.toThrow(
      `UserSummary not found for instrument ${ticker}`
    );
  });

  // describe('BUY Order > SHARES', () => {
  //   test('should throw an error when investmentAmount * currentPrice is greater than ARS', async () => {
  //     vi.spyOn(MarketData, 'getLatestByTicker').mockResolvedValue({
  //       ...mockMarketData,
  //       close: 100.5,
  //     } as MarketData);
  //     vi.spyOn(User, 'getUser').mockResolvedValue(mockUser);
  //     vi.spyOn(UserSummary, 'getInstrumentByTicker').mockResolvedValue(
  //       mockUserSummary
  //     );
  //     vi.spyOn(UserSummary, 'getARS').mockResolvedValue(100);
  //     vi.spyOn(Instrument, 'getByTicker')
  //       .mockResolvedValueOnce(mockInstrument)
  //       .mockResolvedValueOnce(mockARSInstrument);

  //     const input: CreateOrderInput = {
  //       ...validInput,
  //       side: OrderSide.BUY,
  //       investmentType: InvestmentType.SHARES,
  //       investmentAmount: 100,
  //     };

  //     await expect(createOrder(input)).resolves.toEqual({
  //       message: `aaaaaaaaaaaaaa `,
  //     });
  //   });
  // });
});
