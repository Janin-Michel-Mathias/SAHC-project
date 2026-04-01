import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
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

    const usersBookings = await this.bookingRepository.count({
      where: {
        user: { id: userId },
        date: MoreThanOrEqual(startOfToday),
        is_cancelled: false,
      },
    });

    if (
      (user.role === 'employee' || user.role === 'secretary') &&
      usersBookings >= 5
    ) {
      throw new ConflictException(
        'Employees and secretaries can only have 5 active bookings at a time',
      );
    } else if (user.role === 'manager' && usersBookings >= 30) {
      throw new ConflictException(
        'Managers can only have 30 active bookings at a time',
      );
    }

    if (existingBooking) {
      throw new ConflictException('Parking spot already booked for this date');
    }

    const booking = new Booking();
    booking.date = createBookingDto.date;
    booking.user = user;
    booking.parking_spot = parkingSpot;

    return this.bookingRepository.save(booking);
  }

  async cancel(idBooking: number, userId: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id: idBooking },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.user.id !== userId) {
      throw new ConflictException('You can only cancel your own bookings');
    }

    booking.is_cancelled = true;
    booking.cancelled_at = new Date();
    booking.cancelled_by = booking.user;
    return this.bookingRepository.save(booking);
  }
}
