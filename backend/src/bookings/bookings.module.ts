import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { parkingSpotProviders } from '../parking-spots/parking-spots.providers';
import { bookingProviders } from './bookings.providers';
import { databaseProviders } from '../database.providers';
import { AuthModule } from 'src/auth/auth.module';
import { userProviders } from 'src/users/users.providers';
import { MailerService } from '../mailer/mailer.service';
@Module({
  imports: [AuthModule],
  controllers: [BookingsController],
  providers: [
    ...databaseProviders,
    BookingsService,
    ...parkingSpotProviders,
    ...bookingProviders,
    ...userProviders,
    MailerService,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
