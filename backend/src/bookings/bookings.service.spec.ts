import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getMany: jest.Mock;
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
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
        BookingsService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUserRepository,
        },
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

    service = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a booking when user and parking spot exist', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };
    const user = { id: 10, email: 'user@test.com' };
    const parkingSpot = { id: 2, row: 1, col: 3, is_electric: true };
    const savedBooking = {
      id: 99,
      date: dto.date,
      user,
      parking_spot: parkingSpot,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockParkingSpotRepository.findOneBy.mockResolvedValue(parkingSpot);
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.save.mockResolvedValue(savedBooking);

    const result = await service.create(dto, 10);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 10 });
    expect(mockParkingSpotRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(mockBookingRepository.save).toHaveBeenCalled();
    expect(result).toEqual(savedBooking);
  });

  it('throws when user is not found', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow('User not found');
  });

  it('throws when parking spot is not found', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };
    mockUserRepository.findOneBy.mockResolvedValue({ id: 10 });
    mockParkingSpotRepository.findOneBy.mockResolvedValue(null);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Parking spot not found',
    );
  });

  it('throws when parking spot is already booked for the date', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };

    mockUserRepository.findOneBy.mockResolvedValue({ id: 10 });
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockBookingRepository.findOne.mockResolvedValue({ id: 42 });

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Parking spot already booked for this date',
    );
  });
});
