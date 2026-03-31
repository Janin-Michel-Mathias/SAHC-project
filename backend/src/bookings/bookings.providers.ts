import { DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';

export const bookingProviders = [
  {
    provide: 'BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Booking),
    inject: ['DATA_SOURCE'],
  },
];
