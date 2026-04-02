import { Test, TestingModule } from '@nestjs/testing';
import { Between } from 'typeorm';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const parkingSpotRepositoryMock = {
    find: jest.fn(),
  };

  const bookingRepositoryMock = {
    find: jest.fn(),
  };

  const userRepositoryMock = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: 'PARKING_SPOT_REPOSITORY',
          useValue: parkingSpotRepositoryMock,
        },
        {
          provide: 'BOOKING_REPOSITORY',
          useValue: bookingRepositoryMock,
        },
        {
          provide: 'USER_REPOSITORY',
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns aggregated statistics for bookings in the date range', async () => {
    const startDate = new Date('2026-04-01T10:15:00.000Z');
    const endDate = new Date('2026-04-10T08:30:00.000Z');

    const expectedStartDate = new Date('2026-04-01T00:00:00.000Z');
    const expectedEndDate = new Date('2026-04-10T23:59:59.000Z');

    const bookings = [
      {
        id: 1,
        has_checked_in: true,
        is_cancelled: false,
        cancelled_at: null,
        cancelled_by: null,
        parking_spot: { id: 1, is_electric: true },
      },
      {
        id: 2,
        has_checked_in: false,
        is_cancelled: true,
        cancelled_at: new Date('2026-04-03T10:00:00.000Z'),
        cancelled_by: { id: 9 },
        parking_spot: { id: 1, is_electric: true },
      },
      {
        id: 3,
        has_checked_in: false,
        is_cancelled: false,
        cancelled_at: new Date('2026-04-04T10:00:00.000Z'),
        cancelled_by: null,
        parking_spot: { id: 2, is_electric: false },
      },
    ];

    const parkingSpots = [
      { id: 1, row: 1, col: 1, is_electric: true },
      { id: 2, row: 1, col: 2, is_electric: false },
    ];

    bookingRepositoryMock.find.mockResolvedValue(bookings);
    parkingSpotRepositoryMock.find.mockResolvedValue(parkingSpots);

    const result = await service.fetchStatistics(startDate, endDate);

    expect(bookingRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        date: Between(expectedStartDate, expectedEndDate),
      },
      relations: ['parking_spot', 'user', 'cancelled_by'],
    });
    expect(parkingSpotRepositoryMock.find).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      startDate: expectedStartDate,
      endDate: expectedEndDate,
      totalBookings: 3,
      checkedInBookings: 1,
      nonCheckedInBookings: 1,
      cancelledBookings: 1,
      usedElectricSpots: 2,
      spotsUsage: [
        {
          spotId: 1,
          row: 1,
          col: 1,
          isElectric: true,
          totalBookings: 2,
          checkedInBookings: 1,
          nonCheckedInBookings: 0,
          cancelledBookings: 1,
        },
        {
          spotId: 2,
          row: 1,
          col: 2,
          isElectric: false,
          totalBookings: 1,
          checkedInBookings: 0,
          nonCheckedInBookings: 1,
          cancelledBookings: 0,
        },
      ],
    });
  });

  it('returns zeroed statistics when there are no bookings', async () => {
    const expectedStartDate = new Date('2026-04-01T00:00:00.000Z');
    const expectedEndDate = new Date('2026-04-02T23:59:59.000Z');

    bookingRepositoryMock.find.mockResolvedValue([]);
    parkingSpotRepositoryMock.find.mockResolvedValue([]);

    const result = await service.fetchStatistics(
      new Date('2026-04-01T00:00:00.000Z'),
      new Date('2026-04-02T00:00:00.000Z'),
    );

    expect(result).toEqual({
      startDate: expectedStartDate,
      endDate: expectedEndDate,
      totalBookings: 0,
      checkedInBookings: 0,
      nonCheckedInBookings: 0,
      cancelledBookings: 0,
      usedElectricSpots: 0,
      spotsUsage: [],
    });
  });
});
