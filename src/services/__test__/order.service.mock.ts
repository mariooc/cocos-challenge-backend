import { Instrument } from '@/entities/instrument.entity';
import { MarketData } from '@/entities/marketData.entity';
import { User } from '@/entities/user.entity';
import { UserSummary } from '@/entities/userSummary.entity';
import {
  CreateOrderInput,
  InvestmentType,
  OrderSide,
  OrderType,
} from '@/types/order.types';

export const validInput: CreateOrderInput = {
  investmentType: InvestmentType.SHARES,
  side: OrderSide.SELL,
  type: OrderType.LIMIT,
  ticker: 'METR',
  investmentAmount: 100,
  userId: 1,
};

export const mockUser = {
  id: 1,
  email: 'test@test.com',
  accountNumber: '123456789',
} as User;

export const mockMarketData = {
  id: 1,
  high: 100,
  low: 100,
  open: 100,
  close: 100,
  previousClose: 100,
  date: '2023-01-01',
} as MarketData;

export const mockUserSummary = {
  userId: 1,
  instrumentId: 1,
  totalSize: 100,
} as UserSummary;

export const mockInstrument = {
  id: 1,
  ticker: 'METR',
  name: 'MetroGAS S.A.',
  type: 'ACCIONES',
} as Instrument;

export const mockARSInstrument = {
  id: 10,
  ticker: 'ARS',
  name: 'ARS',
  type: 'MONEDa',
} as Instrument;
