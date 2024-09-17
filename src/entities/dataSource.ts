import { DataSource } from 'typeorm';

import { env } from '@/utils/env.utils';
import { Instrument } from './instrument.entity';
import { User } from './user.entity';
import { UserSummary } from './userSummary.entity';
import { MarketData } from './marketData.entity';
import { Order } from './order.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_DB,
  entities: [Instrument, User, UserSummary, MarketData, Order],
  logging: true,
});
