import { Module } from '@nestjs/common';
import { ParkingSpotsService } from './parking-spots.service';
import { ParkingSpotsController } from './parking-spots.controller';
import { parkingSpotProviders } from './parking-spots.providers';
import { bookingProviders } from '../bookings/bookings.providers';
import { databaseProviders } from '../database.providers';
@Module({
  controllers: [ParkingSpotsController],
  providers: [
    ...databaseProviders,
    ParkingSpotsService,
    ...parkingSpotProviders,
    ...bookingProviders,
  ],
  exports: [ParkingSpotsService],
})
export class ParkingSpotsModule {}
