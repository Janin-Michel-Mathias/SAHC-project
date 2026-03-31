import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { parkingSpotProviders } from './parking-spots.providers';
import { bookingProviders } from './bookings.providers';
import { databaseProviders } from '../database.providers';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/auth.guard';
import { userProviders } from 'src/users/users.providers';
@Module({
  imports: [AuthModule],
  controllers: [BookingsController],
  providers: [
    ...databaseProviders,
    BookingsService,
    ...parkingSpotProviders,
    ...bookingProviders,
    AuthGuard,
    ...userProviders,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
