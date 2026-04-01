import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ParkingSpotsDto } from '../parking-spots/dto/parking-spots.dto';

@Injectable()
export class ParkingSpotsService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAllParkingSpots(date: Date): Promise<ParkingSpotsDto[]> {
    if (!date) {
      throw new Error('Date query parameter is required');
    }

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
        bookingId: booking ? booking.id : null,
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
