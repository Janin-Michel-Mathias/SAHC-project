import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('booking-stats')
  @UseGuards(AuthGuard('manager'))
  getStatistics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.statisticsService.fetchBookingStatistics(startDate, endDate);
  }

  @Get('user-stats')
  @UseGuards(AuthGuard('manager'))
  getUserStatistics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.statisticsService.fetchUserStatistics(startDate, endDate);
  }
}
