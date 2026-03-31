import { DataSource } from 'typeorm';
import { ParkingSpot } from './entities/parkingSpots.entity';

export const parkingSpotProviders = [
  {
    provide: 'PARKING_SPOT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ParkingSpot),
    inject: ['DATA_SOURCE'],
  },
];
