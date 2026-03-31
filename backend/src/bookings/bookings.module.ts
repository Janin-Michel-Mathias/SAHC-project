import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { parkingSpotProviders } from './parking-spots.providers';
import { bookingProviders } from './bookings.providers';
import { databaseProviders } from '../database.providers';
@Module({
  controllers: [BookingsController],
  providers: [
    ...databaseProviders,
    BookingsService,
    ...parkingSpotProviders,
    ...bookingProviders,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
