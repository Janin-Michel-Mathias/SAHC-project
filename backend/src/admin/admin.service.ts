import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Between, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    const user = await this.userRepository.findOneBy({
      id: createBookingDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const parkingSpot = await this.parkingSpotRepository.findOneBy({
      id: createBookingDto.parkingSpotId,
    });

    if (!parkingSpot) {
      throw new NotFoundException('Parking spot not found');
    }

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        parking_spot: { id: createBookingDto.parkingSpotId },
        date: createBookingDto.date,
        is_cancelled: false,
      },
      relations: ['parking_spot'],
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (existingBooking) {
      throw new ConflictException('Parking spot already booked for this date');
    }

    const booking = new Booking();
    booking.date = createBookingDto.date;
    booking.user = user;
    booking.parking_spot = parkingSpot;

    return this.bookingRepository.save(booking);
  }

  async cancelBooking(bookingId: number) {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.is_cancelled = true;
    booking.cancelled_at = new Date();

    return this.bookingRepository.save(booking);
  }

  async updateBooking(bookingId: number, updateData: UpdateBookingDto) {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (updateData.date) {
      booking.date = updateData.date;
    }

    if (updateData.newParkingSpotId) {
      const parkingSpot = await this.parkingSpotRepository.findOneBy({
        id: updateData.newParkingSpotId,
      });

      if (!parkingSpot) {
        throw new NotFoundException('Parking spot not found');
      }

      console.log(updateData.date, booking.date);

      const startOfDay = new Date(updateData.date || booking.date);
      const endOfDay = new Date(updateData.date || booking.date);
      startOfDay.setHours(0, 0, 0);
      endOfDay.setHours(23, 59, 59);

      const existingBooking = await this.bookingRepository.findOne({
        where: {
          parking_spot: { id: updateData.newParkingSpotId },
          date: Between(startOfDay, endOfDay),
          is_cancelled: false,
        },
        relations: ['parking_spot'],
      });

      if (existingBooking && existingBooking.id !== bookingId) {
        throw new ConflictException(
          'New parking spot already booked for this date',
        );
      }

      booking.parking_spot = parkingSpot;
    }

    return this.bookingRepository.save(booking);
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.authService.register(
      createUserDto.email,
      createUserDto.password,
      createUserDto.first_name,
      createUserDto.last_name,
      createUserDto.role,
    );
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.email = null;
    user.first_name = '';
    user.last_name = '';
    user.role = '';
    user.password = '';
    user.deleted_at = new Date();

    return this.userRepository.save(user);
  }

  async updateUser(
    userId: number,
    updateData: Omit<Partial<CreateUserDto>, 'password'>,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: updateData.email,
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }

      user.email = updateData.email;
    }
    if (updateData.first_name) {
      user.first_name = updateData.first_name;
    }
    if (updateData.last_name) {
      user.last_name = updateData.last_name;
    }
    if (updateData.role) {
      user.role = updateData.role;
    }

    return this.userRepository.save(user);
  }
}
