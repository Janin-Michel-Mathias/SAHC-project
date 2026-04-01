import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type JwtPayload } from '../auth/current-user.decorator';

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

  @Delete(':id')
  @UseGuards(AuthGuard)
  cancel(@Param('id') idBooking: string, @CurrentUser() user: JwtPayload) {
    return this.bookingsService.cancel(Number(idBooking), user.sub);
  }

  @Post(':id/check-in')
  @UseGuards(AuthGuard)
  checkIn(@Param('id') idBooking: string, @CurrentUser() user: JwtPayload) {
    return this.bookingsService.checkIn(Number(idBooking), user.sub);
  }
}
