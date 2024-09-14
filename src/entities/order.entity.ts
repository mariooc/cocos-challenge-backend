import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/entities/user.entity';
import { Instrument } from '@/entities/instrument.entity';
import { OrderSide, OrderStatus, OrderType } from '@/types/order.types';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, enum: OrderType })
  type: string;

  @Column({ type: 'varchar', length: 10, enum: OrderSide })
  side: string;

  @Column({ type: 'varchar', length: 20, enum: OrderStatus })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  datetime: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userid' })
  user: User;

  @ManyToOne(() => Instrument, (instrument) => instrument.orders)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;
}
