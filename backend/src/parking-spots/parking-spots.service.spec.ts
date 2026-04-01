import { Test, TestingModule } from '@nestjs/testing';
import { ParkingSpotsService } from './parking-spots.service';

describe('ParkingSpotsService', () => {
  let service: ParkingSpotsService;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getMany: jest.Mock;
  };

  const mockParkingSpotRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
  };

  const mockBookingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    mockBookingRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingSpotsService,
        {
          provide: 'PARKING_SPOT_REPOSITORY',
          useValue: mockParkingSpotRepository,
        },
        {
          provide: 'BOOKING_REPOSITORY',
          useValue: mockBookingRepository,
        },
      ],
    }).compile();

    service = module.get<ParkingSpotsService>(ParkingSpotsService);
  });

  it('returns parking spots with booking details for a day', async () => {
    const date = new Date('2026-03-31T08:30:00.000Z');

    mockParkingSpotRepository.find.mockResolvedValue([
      { id: 1, row: 1, col: 1, is_electric: false },
      { id: 2, row: 1, col: 2, is_electric: true },
    ]);

    queryBuilder.getMany.mockResolvedValue([
      {
        id: 12,
        parking_spot: { id: 2 },
        user: {
          id: 5,
          email: 'booked@test.com',
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'employee',
        },
      },
    ]);

    const result = await service.findAllParkingSpots(date);

    expect(mockBookingRepository.createQueryBuilder).toHaveBeenCalledWith(
      'booking',
    );
    expect(queryBuilder.where).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        row: 1,
        column: 1,
        isElectric: false,
        bookingId: null,
        bookedBy: null,
      },
      {
        id: 2,
        row: 1,
        column: 2,
        isElectric: true,
        bookingId: 12,
        bookedBy: {
          id: 5,
          email: 'booked@test.com',
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'employee',
          created_at: undefined,
          deleted_at: undefined,
        },
      },
    ]);
  });
});
