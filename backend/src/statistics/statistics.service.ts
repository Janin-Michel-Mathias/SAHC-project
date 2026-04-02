import { Inject, Injectable } from '@nestjs/common';
import { Booking } from '../bookings/entities/booking.entity';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { User } from '../users/entities/user.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject('PARKING_SPOT_REPOSITORY')
    private parkingSpotRepository: Repository<ParkingSpot>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async fetchStatistics(startDate: Date, endDate: Date) {
    const earlyStartDate = new Date(startDate);
    const lateEndDate = new Date(endDate);

    earlyStartDate.setHours(0, 0, 0);
    lateEndDate.setHours(23, 59, 59);

    const allBookings = await this.bookingRepository.find({
      where: {
        date: Between(earlyStartDate, lateEndDate),
      },
      relations: ['parking_spot', 'user', 'cancelled_by'],
    });

    const totalBookings = allBookings.length;
    const checkedInBookings = allBookings.filter(
      (booking) => booking.has_checked_in,
    ).length;
    const nonCheckedInBookings = allBookings.filter(
      (booking) =>
        !booking.has_checked_in &&
        booking.cancelled_at &&
        !booking.cancelled_by,
    ).length;
    const cancelledBookings = allBookings.filter(
      (booking) => booking.is_cancelled,
    ).length;
    const usedElectricSpots = allBookings.filter(
      (booking) => booking.parking_spot.is_electric,
    ).length;

    const allParkingSpots = await this.parkingSpotRepository.find();

    const spotsUsage = allParkingSpots.map((spot) => {
      const spotBookings = allBookings.filter(
        (booking) => booking.parking_spot.id === spot.id,
      );
      return {
        spotId: spot.id,
        row: spot.row,
        col: spot.col,
        isElectric: spot.is_electric,
        totalBookings: spotBookings.length,
        checkedInBookings: spotBookings.filter(
          (booking) => booking.has_checked_in,
        ).length,
        nonCheckedInBookings: spotBookings.filter(
          (booking) =>
            !booking.has_checked_in &&
            booking.cancelled_at &&
            !booking.cancelled_by,
        ).length,
        cancelledBookings: spotBookings.filter(
          (booking) => booking.is_cancelled,
        ).length,
      };
    });

    return {
      startDate: earlyStartDate,
      endDate: lateEndDate,
      totalBookings,
      checkedInBookings,
      nonCheckedInBookings,
      cancelledBookings,
      usedElectricSpots,
      spotsUsage,
    };
  }
}
