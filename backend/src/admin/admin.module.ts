import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { userProviders } from 'src/users/users.providers';
import { bookingProviders } from 'src/bookings/bookings.providers';
import { parkingSpotProviders } from 'src/parking-spots/parking-spots.providers';
import { AuthModule } from 'src/auth/auth.module';
import { databaseProviders } from 'src/database.providers';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    ...databaseProviders,
    AdminService,
    ...parkingSpotProviders,
    ...bookingProviders,
    ...userProviders,
    AuthService,
    MailerService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
