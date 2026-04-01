import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module';
import { AdminModule } from './admin/admin.module';
import { StatisticsModule } from './statistics/statistics.module';
import { databaseProviders } from './database.providers';
import { AuthModule } from './auth/auth.module';
import { ParkingSpotsModule } from './parking-spots/parking-spots.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    BookingsModule,
    AdminModule,
    StatisticsModule,
    AuthModule,
    ParkingSpotsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
