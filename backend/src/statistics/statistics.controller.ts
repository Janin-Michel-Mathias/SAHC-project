import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  getStatistics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.statisticsService.fetchStatistics(startDate, endDate);
  }
}
