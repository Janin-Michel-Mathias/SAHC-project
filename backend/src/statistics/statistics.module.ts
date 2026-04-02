import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { AuthModule } from '../auth/auth.module';
import { databaseProviders } from '../database.providers';
import { parkingSpotProviders } from '../parking-spots/parking-spots.providers';
import { AuthService } from '../auth/auth.service';
import { bookingProviders } from '../bookings/bookings.providers';
import { userProviders } from '../users/users.providers';

@Module({
  imports: [AuthModule],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    ...databaseProviders,
    ...parkingSpotProviders,
    ...bookingProviders,
    ...userProviders,
    AuthService,
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
