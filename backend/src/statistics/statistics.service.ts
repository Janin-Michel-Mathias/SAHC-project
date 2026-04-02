import { Inject, Injectable } from '@nestjs/common';
import { Booking } from '../bookings/entities/booking.entity';
import { ParkingSpot } from '../parking-spots/entities/parkingSpots.entity';
import { Between, IsNull, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

type UserStatistics = {
  userId: number;
  email: string;
  totalBookings: number;
  checkedInBookings: number;
  nonCheckedInBookings: number;
  cancelledBookings: number;
};

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

  async fetchBookingStatistics(startDate: Date, endDate: Date) {
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

  async fetchUserStatistics(startDate: Date, endDate: Date) {
    const earlyStartDate = new Date(startDate);
    const lateEndDate = new Date(endDate);

    earlyStartDate.setHours(0, 0, 0);
    lateEndDate.setHours(23, 59, 59);

    const allUsers = await this.userRepository.find({
      where: {
        deleted_at: IsNull(),
      },
    });

    const allBookings = await this.bookingRepository.find({
      where: {
        date: Between(earlyStartDate, lateEndDate),
        user: { deleted_at: IsNull() },
      },
      relations: ['parking_spot', 'user', 'cancelled_by'],
    });

    const userStatsMap = new Map<number, UserStatistics>();

    allUsers.forEach((user) => {
      userStatsMap.set(user.id, {
        userId: user.id,
        email: user.email || '',
        totalBookings: 0,
        checkedInBookings: 0,
        nonCheckedInBookings: 0,
        cancelledBookings: 0,
      });
    });

    allBookings.forEach((booking) => {
      const userId = booking.user.id;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          email: booking.user.email!,
          totalBookings: 0,
          checkedInBookings: 0,
          nonCheckedInBookings: 0,
          cancelledBookings: 0,
        });
      }

      const userStats = userStatsMap.get(userId)!;
      userStats.totalBookings++;

      if (booking.has_checked_in) {
        userStats.checkedInBookings++;
      } else if (booking.cancelled_at && !booking.cancelled_by) {
        userStats.nonCheckedInBookings++;
      }

      if (booking.is_cancelled) {
        userStats.cancelledBookings++;
      }
    });

    return {
      startDate: earlyStartDate,
      endDate: lateEndDate,
      users: Array.from(userStatsMap.values()),
    };
  }
}
