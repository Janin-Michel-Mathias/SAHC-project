import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
import { AdminModule } from './admin/admin.module';
import { StatisticsModule } from './statistics/statistics.module';
import { databaseProviders } from './database.providers';

@Module({
  imports: [BookingsModule, AdminModule, StatisticsModule],
  controllers: [AppController],
  providers: [AppService, ...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
