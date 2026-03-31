import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser, type JwtPayload } from 'src/auth/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.create(createBookingDto, user.sub);
  }

  @Get()
  findAllParkingSpots(@Query('date') date: Date) {
    return this.bookingsService.findAllParkingSpots(date);
  }
}
