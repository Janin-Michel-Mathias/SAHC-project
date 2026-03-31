import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ParkingSpot } from './parkingSpots.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  has_checked_in: boolean;

  @Column()
  is_cancelled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  cancelled_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelled_by: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ParkingSpot, { nullable: false })
  @JoinColumn({ name: 'parking_spot_id' })
  parking_spot: ParkingSpot;
}
