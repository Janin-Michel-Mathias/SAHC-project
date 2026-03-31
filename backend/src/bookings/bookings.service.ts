import { Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Repository } from 'typeorm';
import { ParkingSpot } from './entities/parkingSpots.entity';
import { Booking } from './entities/booking.entity';
import { ParkingSpotsDto } from './dto/parking-spots.dto';
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
      throw new Error('User not found');
    }

    const parkingSpot = await this.parkingSpotRepository.findOneBy({
      id: createBookingDto.parkingSpotId,
    });

    if (!parkingSpot) {
      throw new Error('Parking spot not found');
    }

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        parking_spot: { id: createBookingDto.parkingSpotId },
        date: createBookingDto.date,
        is_cancelled: false,
      },
      relations: ['parking_spot'],
    });

    if (existingBooking) {
      throw new Error('Parking spot already booked for this date');
    }

    const booking = new Booking();
    booking.date = createBookingDto.date;
    booking.user = user;
    booking.parking_spot = parkingSpot;

    return this.bookingRepository.save(booking);
  }

  async findAllParkingSpots(date: Date): Promise<ParkingSpotsDto[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59);

    const parkingSpots = await this.parkingSpotRepository.find();

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.parking_spot', 'parking_spot')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.date BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('booking.is_cancelled = false')
      .getMany();

    const bookingsMap = new Map<number, Booking>();
    bookings.forEach((booking) => {
      bookingsMap.set(booking.parking_spot.id, booking);
    });

    return parkingSpots.map((spot) => {
      const booking = bookingsMap.get(spot.id);
      return {
        id: spot.id,
        row: spot.row,
        column: spot.col,
        isElectric: spot.is_electric,
        bookedBy: booking
          ? {
              id: booking.user.id,
              email: booking.user.email,
              first_name: booking.user.first_name,
              last_name: booking.user.last_name,
              role: booking.user.role,
            }
          : null,
      };
    });
  }
}
