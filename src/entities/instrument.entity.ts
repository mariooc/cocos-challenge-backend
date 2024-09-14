import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import { Order } from '@/entities/order.entity';
import { MarketData } from '@/entities/marketData.entity';
import { UserSummary } from './userSummary.entity';

@Entity({ name: 'instruments' })
export class Instrument extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  ticker: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  type: string;

  @OneToMany(() => Order, (order) => order.instrument)
  @JoinColumn({ name: 'instrumentid' })
  orders: Order[];

  @OneToMany(() => MarketData, (marketData) => marketData.instrument)
  @JoinColumn({ name: 'instrumentid' })
  marketData: MarketData[];

  @OneToMany(() => UserSummary, (userSummary) => userSummary.instrument)
  @JoinColumn({ name: 'instrumentid' })
  userSummaries: UserSummary[];

  static getByTicker(ticker: string): Promise<Instrument | null> {
    return this.createQueryBuilder('instrument')
      .where('instrument.ticker = :ticker', {
        ticker,
      })
      .getOne();
  }
  static searchByTicker(ticker: string): Promise<Instrument[]> {
    return this.createQueryBuilder('instrument')
      .where('instrument.ticker LIKE :ticker OR instrument.name LIKE :ticker', {
        ticker: `%${ticker}%`,
      })
      .getMany();
  }
}
