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
    count: jest.fn(),
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
    mockBookingRepository.count.mockResolvedValue(0);
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
    mockBookingRepository.count.mockResolvedValue(0);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Parking spot already booked for this date',
    );
  });

  it('throws when employee reaches the active booking limit', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };

    mockUserRepository.findOneBy.mockResolvedValue({
      id: 10,
      role: 'employee',
    });
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.count.mockResolvedValue(5);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Employees and secretaries can only have 5 active bookings at a time',
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('throws when secretary reaches the active booking limit', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };

    mockUserRepository.findOneBy.mockResolvedValue({
      id: 10,
      role: 'secretary',
    });
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.count.mockResolvedValue(6);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Employees and secretaries can only have 5 active bookings at a time',
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('allows employee booking below the active booking limit', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };
    const user = { id: 10, role: 'employee' };
    const parkingSpot = { id: 2 };
    const savedBooking = {
      id: 100,
      date: dto.date,
      user,
      parking_spot: parkingSpot,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockParkingSpotRepository.findOneBy.mockResolvedValue(parkingSpot);
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.count.mockResolvedValue(4);
    mockBookingRepository.save.mockResolvedValue(savedBooking);

    await expect(service.create(dto, 10)).resolves.toEqual(savedBooking);
    expect(mockBookingRepository.save).toHaveBeenCalled();
  });

  it('throws when manager reaches the active booking limit', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };

    mockUserRepository.findOneBy.mockResolvedValue({ id: 10, role: 'manager' });
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.count.mockResolvedValue(30);

    await expect(service.create(dto, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto, 10)).rejects.toThrow(
      'Managers can only have 30 active bookings at a time',
    );
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('allows manager booking below the active booking limit', async () => {
    const dto = { date: new Date('2026-03-31'), parkingSpotId: 2 };
    const user = { id: 10, role: 'manager' };
    const parkingSpot = { id: 2 };
    const savedBooking = {
      id: 101,
      date: dto.date,
      user,
      parking_spot: parkingSpot,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockParkingSpotRepository.findOneBy.mockResolvedValue(parkingSpot);
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.count.mockResolvedValue(29);
    mockBookingRepository.save.mockResolvedValue(savedBooking);

    await expect(service.create(dto, 10)).resolves.toEqual(savedBooking);
    expect(mockBookingRepository.save).toHaveBeenCalled();
  });

  it('cancels a booking', async () => {
    const booking = {
      id: 50,
      is_cancelled: false,
      user: { id: 10 },
    };

    mockBookingRepository.findOne.mockResolvedValue(booking);
    mockBookingRepository.save.mockResolvedValue({
      ...booking,
      is_cancelled: true,
    });

    const result = await service.cancel(50, 10);

    expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
      where: { id: 50 },
      relations: ['user'],
    });
    expect(mockBookingRepository.save).toHaveBeenCalledWith({
      ...booking,
      is_cancelled: true,
    });
    expect(result.is_cancelled).toEqual(true);
  });

  it('throws when trying to cancel a non-existent booking', async () => {
    mockBookingRepository.findOne.mockResolvedValue(null);

    await expect(service.cancel(999, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.cancel(999, 10)).rejects.toThrow('Booking not found');
  });

  it('throws when trying to cancel a booking that belongs to another user', async () => {
    const booking = {
      id: 50,
      is_cancelled: false,
      user: { id: 20 },
    };

    mockBookingRepository.findOne.mockResolvedValue(booking);

    await expect(service.cancel(50, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.cancel(50, 10)).rejects.toThrow(
      'You can only cancel your own bookings',
    );
  });

  it('checks in a booking', async () => {
    const booking = {
      id: 60,
      has_checked_in: false,
      user: { id: 10 },
    };

    mockBookingRepository.findOne.mockResolvedValue(booking);
    mockBookingRepository.save.mockResolvedValue({
      ...booking,
      has_checked_in: true,
      checked_in_at: new Date(),
    });

    const result = await service.checkIn(60, 10);

    expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
      where: { id: 60 },
      relations: ['user'],
    });
    expect(mockBookingRepository.save).toHaveBeenCalledWith({
      ...booking,
      has_checked_in: true,
      checked_in_at: result.checked_in_at,
    });
    expect(result.has_checked_in).toEqual(true);
    expect(result.checked_in_at).toBeInstanceOf(Date);
  });

  it('throws when trying to check in to a non-existent booking', async () => {
    mockBookingRepository.findOne.mockResolvedValue(null);

    await expect(service.checkIn(999, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.checkIn(999, 10)).rejects.toThrow('Booking not found');
  });

  it('throws when trying to check in to a booking that belongs to another user', async () => {
    const booking = {
      id: 60,
      has_checked_in: false,
      user: { id: 20 },
    };

    mockBookingRepository.findOne.mockResolvedValue(booking);

    await expect(service.checkIn(60, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.checkIn(60, 10)).rejects.toThrow(
      'You can only check in to your own bookings',
    );
  });
});
