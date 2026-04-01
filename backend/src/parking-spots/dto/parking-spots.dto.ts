import { User } from 'src/users/entities/user.entity';

export class ParkingSpotsDto {
  id!: number;
  row!: string;
  column!: string;
  isElectric!: boolean;
  bookingId!: number | null;
  bookedBy!: Omit<User, 'password'> | null;
}
