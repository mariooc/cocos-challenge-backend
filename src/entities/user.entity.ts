import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Order } from '@/entities/order.entity';
import { UserSummary } from './userSummary.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, name: 'accountnumber' })
  accountNumber: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => UserSummary, (userSummary) => userSummary.user)
  userSummaries: UserSummary[];

  static getUser(userId: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.id = :userId', {
        userId,
      })
      .getOne();
  }
}
