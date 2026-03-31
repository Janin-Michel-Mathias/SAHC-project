import { Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Repository } from 'typeorm';
import { ParkingSpot } from './entities/parkingSpots.entity';
import { Booking } from './entities/booking.entity';
import { ParkingSpotsDto } from './dto/parking-spots.dto';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
  ) {}

  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  findAll() {
    return `This action returns all bookings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
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

    console.log(bookings);
    const bookedSpotIds = new Set(
      bookings.map((booking) => booking.parking_spot.id),
    );

    return parkingSpots.map((spot) => ({
      id: spot.id,
      row: spot.row,
      column: spot.col,
      is_electric: spot.is_electric,
      is_booked: bookedSpotIds.has(spot.id),
    }));
  }
}
