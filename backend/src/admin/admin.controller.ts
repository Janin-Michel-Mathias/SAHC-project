import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Patch,
  Param,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('bookings')
  @UseGuards(AuthGuard('secretary'))
  findAllBookings() {
    return this.adminService.findAllBookings();
  }

  @Get('users')
  @UseGuards(AuthGuard('secretary'))
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('bookings')
  @UseGuards(AuthGuard('secretary'))
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.adminService.createBooking(createBookingDto);
  }

  @Delete('bookings/:id')
  @UseGuards(AuthGuard('secretary'))
  cancelBooking(@Param('id') bookingId: number) {
    return this.adminService.cancelBooking(bookingId);
  }

  @Patch('bookings/:id')
  @UseGuards(AuthGuard('secretary'))
  updateBooking(
    @Param('id') bookingId: number,
    @Body() updateData: UpdateBookingDto,
  ) {
    return this.adminService.updateBooking(bookingId, updateData);
  }

  @Post('users')
  @UseGuards(AuthGuard('secretary'))
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('secretary'))
  @HttpCode(204)
  deleteUser(@Param('id') userId: number) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard('secretary'))
  updateUser(
    @Param('id') userId: number,
    @Body() updateData: Omit<Partial<CreateUserDto>, 'password'>,
  ) {
    return this.adminService.updateUser(userId, updateData);
  }
}
