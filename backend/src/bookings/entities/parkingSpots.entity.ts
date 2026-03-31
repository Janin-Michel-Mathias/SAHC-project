import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['col', 'row'])
export class ParkingSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  col: string;

  @Column()
  row: string;

  @Column()
  is_electric: boolean;
}
