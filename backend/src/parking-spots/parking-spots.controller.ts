import { Controller, Get, Query } from '@nestjs/common';
import { ParkingSpotsService } from './parking-spots.service';

@Controller('parking-spots')
export class ParkingSpotsController {
  constructor(private readonly parkingSpotsService: ParkingSpotsService) {}

  @Get()
  findAllParkingSpots(@Query('date') date: Date) {
    return this.parkingSpotsService.findAllParkingSpots(date);
  }
}
