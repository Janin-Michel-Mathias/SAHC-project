import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private mailerService: MailerService,
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

    const startDate = new Date(createBookingDto.date);
    const endDate = new Date(createBookingDto.date);
    startDate.setHours(0, 0, 0);
    endDate.setHours(23, 59, 59);

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        parking_spot: { id: createBookingDto.parkingSpotId },
        date: Between(startDate, endDate),
        is_cancelled: false,
      },
      relations: ['parking_spot'],
    });

    if (existingBooking) {
      throw new ConflictException('Parking spot already booked for this date');
    }

    const usersBookings = await this.bookingRepository.count({
      where: {
        user: { id: userId },
        date: MoreThanOrEqual(startDate),
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

    const booking = new Booking();
    booking.date = createBookingDto.date;
    booking.user = user;
    booking.parking_spot = parkingSpot;

    await this.bookingRepository.save(booking);
    void this.mailerService.sendConfirmationEmail(
      user.email!,
      booking.date,
      `${parkingSpot.row}${parkingSpot.col}`,
      parkingSpot.is_electric,
    );

    return booking;
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

    await this.bookingRepository.save(booking);
    void this.mailerService.sendCancellationEmail(
      booking.user.email!,
      booking.date,
      `${booking.parking_spot.row}${booking.parking_spot.col}`,
      booking.parking_spot.is_electric,
    );

    return booking;
  }

  async checkIn(spot: string, userId: number) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59);

    const row = spot.charAt(0);
    const col = spot.slice(1);

    const booking = await this.bookingRepository.findOne({
      where: {
        date: Between(todayStart, todayEnd),
        parking_spot: { row: row, col: col },
        is_cancelled: false,
      },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.user.id !== userId) {
      throw new ConflictException('You can only check in to your own bookings');
    }

    booking.has_checked_in = true;
    booking.checked_in_at = new Date();
    return this.bookingRepository.save(booking);
  }

  async selfBookings(userId: number, userRole: string) {
    const today = new Date();
    today.setHours(0, 0, 0);

    const bookings = await this.bookingRepository.find({
      where: {
        user: { id: userId },
        date: MoreThanOrEqual(today),
        is_cancelled: false,
      },
      relations: ['parking_spot'],
    });

    const totalBookings = userRole === 'manager' ? 30 : 5;
    const remainingBookings = totalBookings - bookings.length;

    return { remainingBookings: remainingBookings, bookings: bookings };
  }

  @Cron('0 11 * * *')
  async verifyCheckIn() {
    const today = new Date();
    today.setHours(23, 59, 59);

    const bookingsToCancel = await this.bookingRepository.find({
      where: {
        date: LessThanOrEqual(today),
        has_checked_in: false,
        is_cancelled: false,
      },
    });

    for (const booking of bookingsToCancel) {
      booking.has_checked_in = false;
      booking.is_cancelled = true;
      booking.cancelled_at = new Date();
      await this.bookingRepository.save(booking);
      void this.mailerService.sendCancellationEmail(
        booking.user.email!,
        booking.date,
        `${booking.parking_spot.row}${booking.parking_spot.col}`,
        booking.parking_spot.is_electric,
      );
    }
  }
}
