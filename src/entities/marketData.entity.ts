import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import { Instrument } from '@/entities/instrument.entity';

@Entity({ name: 'marketdata' })
export class MarketData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  high: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  low: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  open: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  close: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'previousclose' })
  previousClose: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Instrument, (instrument) => instrument.marketData)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  static getLatestByTicker(ticker: string): Promise<MarketData | null> {
    return this.createQueryBuilder('marketData')
      .innerJoin('marketData.instrument', 'instrument')
      .where('instrument.ticker = :ticker', { ticker })
      .orderBy('marketData.date', 'DESC')
      .getOne();
  }
}
