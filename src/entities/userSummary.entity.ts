import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  BaseEntity,
} from 'typeorm';

import { User } from '@/entities/user.entity';
import { Instrument } from '@/entities/instrument.entity';
import { Summary } from '@/types/portfolio.types';
import { FIAT_TICKER } from '@/constants/orders.constant';

@Entity('users_summary')
export class UserSummary extends BaseEntity {
  @PrimaryColumn({ type: 'int', name: 'userid' })
  userId: number;

  @PrimaryColumn({ type: 'int', name: 'instrumentid' })
  instrumentId: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'totalsize' })
  totalSize: number;

  @ManyToOne(() => User, (user) => user.userSummaries)
  @JoinColumn({ name: 'userid' })
  user: User;

  @ManyToOne(() => Instrument, (instrument) => instrument.userSummaries)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  static getInstrumentByTicker(
    userId: number,
    ticker: string
  ): Promise<UserSummary | null> {
    return this.createQueryBuilder('userSummary')
      .innerJoin('userSummary.instrument', 'instrument')
      .where('userSummary.userId = :userId', { userId })
      .andWhere('instrument.ticker = :ticker', { ticker })
      .getOne();
  }

  static async getARS(userId: number): Promise<number> {
    const instrument = await this.createQueryBuilder('userSummary')
      .innerJoin('userSummary.instrument', 'instrument')
      .where('userSummary.userId = :userId', { userId })
      .andWhere('instrument.ticker = :ticker', { ticker: FIAT_TICKER })
      .getOne();

    return instrument?.totalSize || 0;
  }

  static async getPorfolio(userId: number): Promise<Summary[]> {
    return this.createQueryBuilder('userSummary')
      .select([
        'userSummary.instrumentId AS "instrumentId"',
        'userSummary.totalSize AS "totalSize"',
        'instrument.name AS "name"',
        'instrument.ticker AS "ticker"',
        `
        CASE
          WHEN instrument.ticker = 'ARS' THEN 1
          ELSE latest.close
        END as "close"
        `,
        `
        CASE
          WHEN instrument.ticker = 'ARS' THEN 1
          ELSE latest.previousclose
        END as "previousClose"
        `,
      ])
      .leftJoin('userSummary.instrument', 'instrument')
      .leftJoin(
        'latest_marketdata',
        'latest',
        'latest.instrumentid = userSummary.instrumentid'
      )
      .where('userSummary.userId = :userId', { userId })
      .getRawMany();
  }
}
