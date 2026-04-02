import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { MailerService } from '../mailer/mailer.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockParkingSpotRepository = {
    findOneBy: jest.fn(),
  };

  const mockBookingRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockAuthService = {
    register: jest.fn(),
  };

  const mockMailerService = {
    sendConfirmationEmail: jest.fn(),
    sendCancellationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: 'PARKING_SPOT_REPOSITORY',
          useValue: mockParkingSpotRepository,
        },
        {
          provide: 'BOOKING_REPOSITORY',
          useValue: mockBookingRepository,
        },
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a booking when user and parking spot exist', async () => {
    const dto = {
      userId: 10,
      parkingSpotId: 2,
      date: new Date('2026-03-31'),
    };

    const user = { id: 10, email: 'user@test.com' };
    const parkingSpot = { id: 2, row: 1, col: 3, is_electric: true };
    const savedBooking = {
      date: dto.date,
      user,
      parking_spot: parkingSpot,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockParkingSpotRepository.findOneBy.mockResolvedValue(parkingSpot);
    mockBookingRepository.findOne.mockResolvedValue(null);
    mockBookingRepository.save.mockResolvedValue(savedBooking);

    const result = await service.createBooking(dto);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 10 });
    expect(mockParkingSpotRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(mockBookingRepository.save).toHaveBeenCalled();
    expect(result).toMatchObject(savedBooking);
  });

  it('throws when creating booking and user is not found', async () => {
    const dto = { userId: 10, parkingSpotId: 2, date: new Date('2026-03-31') };
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(service.createBooking(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.createBooking(dto)).rejects.toThrow('User not found');
  });

  it('throws when creating booking and parking spot is not found', async () => {
    const dto = { userId: 10, parkingSpotId: 2, date: new Date('2026-03-31') };

    mockUserRepository.findOneBy.mockResolvedValue({ id: 10 });
    mockParkingSpotRepository.findOneBy.mockResolvedValue(null);

    await expect(service.createBooking(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.createBooking(dto)).rejects.toThrow(
      'Parking spot not found',
    );
  });

  it('throws when creating booking and spot is already booked for date', async () => {
    const dto = { userId: 10, parkingSpotId: 2, date: new Date('2026-03-31') };

    mockUserRepository.findOneBy.mockResolvedValue({ id: 10 });
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockBookingRepository.findOne.mockResolvedValue({ id: 42 });

    await expect(service.createBooking(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.createBooking(dto)).rejects.toThrow(
      'Parking spot already booked for this date',
    );
  });

  it('cancels a booking', async () => {
    const booking = {
      id: 50,
      is_cancelled: false,
      cancelled_at: null,
      user: { id: 10, email: 'user@test.com' },
      parking_spot: { row: 1, col: 3, is_electric: true },
    };

    mockBookingRepository.findOneBy.mockResolvedValue(booking);
    mockBookingRepository.save.mockResolvedValue({
      ...booking,
      is_cancelled: true,
      cancelled_at: new Date('2026-03-31'),
    });

    const result = await service.cancelBooking(50);

    expect(mockBookingRepository.findOneBy).toHaveBeenCalledWith({ id: 50 });
    expect(mockBookingRepository.save).toHaveBeenCalled();
    expect(result.is_cancelled).toEqual(true);
    expect(result.cancelled_at).toBeInstanceOf(Date);
  });

  it('throws when cancelling a non-existent booking', async () => {
    mockBookingRepository.findOneBy.mockResolvedValue(null);

    await expect(service.cancelBooking(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.cancelBooking(999)).rejects.toThrow(
      'Booking not found',
    );
  });

  it('throws when updating a non-existent booking', async () => {
    mockBookingRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateBooking(999, { date: new Date('2026-03-31') }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.updateBooking(999, { date: new Date('2026-03-31') }),
    ).rejects.toThrow('Booking not found');
  });

  it('updates booking date when provided', async () => {
    const booking = {
      id: 1,
      date: new Date('2026-03-30'),
      parking_spot: { id: 1 },
    };

    const updatedDate = new Date('2026-03-31');

    mockBookingRepository.findOneBy.mockResolvedValue(booking);
    mockBookingRepository.save.mockImplementation(
      (value: unknown): unknown => value,
    );

    const result = await service.updateBooking(1, { date: updatedDate });

    expect(mockBookingRepository.save).toHaveBeenCalled();
    expect(result.date).toEqual(updatedDate);
  });

  it('throws when updating booking and new parking spot does not exist', async () => {
    const booking = {
      id: 1,
      date: new Date('2026-03-31'),
      parking_spot: { id: 1 },
    };

    mockBookingRepository.findOneBy.mockResolvedValue(booking);
    mockParkingSpotRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateBooking(1, { newParkingSpotId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.updateBooking(1, { newParkingSpotId: 99 }),
    ).rejects.toThrow('Parking spot not found');
  });

  it('throws when updating booking and new parking spot is already booked', async () => {
    const booking = {
      id: 1,
      date: new Date('2026-03-31'),
      parking_spot: { id: 1 },
    };

    mockBookingRepository.findOneBy.mockResolvedValue(booking);
    mockParkingSpotRepository.findOneBy.mockResolvedValue({ id: 3 });
    mockBookingRepository.findOne.mockResolvedValue({ id: 2 });

    await expect(
      service.updateBooking(1, { newParkingSpotId: 3 }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.updateBooking(1, { newParkingSpotId: 3 }),
    ).rejects.toThrow('New parking spot already booked for this date');
  });

  it('creates a user through auth service', async () => {
    const dto = {
      email: 'new@test.com',
      password: 'plain-password',
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'employee',
    };

    const createdUser = { id: 1, ...dto, password: 'hashed-password' };
    mockAuthService.register.mockResolvedValue(createdUser);

    const result = await service.createUser(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(
      dto.email,
      dto.password,
      dto.first_name,
      dto.last_name,
      dto.role,
    );
    expect(result).toEqual(createdUser);
  });

  it('deletes user data and marks deleted_at', async () => {
    const user = {
      id: 1,
      email: 'john@test.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'employee',
      password: 'hashed-password',
      deleted_at: null,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockUserRepository.save.mockImplementation(
      (value: unknown): unknown => value,
    );

    const result = await service.deleteUser(1);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(result.email).toEqual(null);
    expect(result.first_name).toEqual('');
    expect(result.last_name).toEqual('');
    expect(result.role).toEqual('');
    expect(result.password).toEqual('');
    expect(result.deleted_at).toBeInstanceOf(Date);
  });

  it('throws when deleting a non-existent user', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(service.deleteUser(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.deleteUser(999)).rejects.toThrow('User not found');
  });

  it('throws when updating user email and email is already used by another user', async () => {
    mockUserRepository.findOneBy
      .mockResolvedValueOnce({ id: 1, email: 'old@test.com' })
      .mockResolvedValueOnce({ id: 2, email: 'new@test.com' });

    await expect(
      service.updateUser(1, { email: 'new@test.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates user fields', async () => {
    const user = {
      id: 1,
      email: 'old@test.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'employee',
    };

    mockUserRepository.findOneBy
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    mockUserRepository.save.mockImplementation(
      (value: unknown): unknown => value,
    );

    const result = await service.updateUser(1, {
      email: 'new@test.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'manager',
    });

    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(result.email).toEqual('new@test.com');
    expect(result.first_name).toEqual('Jane');
    expect(result.last_name).toEqual('Smith');
    expect(result.role).toEqual('manager');
  });

  it('throws when updating a non-existent user', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateUser(999, { first_name: 'Jane' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.updateUser(999, { first_name: 'Jane' }),
    ).rejects.toThrow('User not found');
  });
});
