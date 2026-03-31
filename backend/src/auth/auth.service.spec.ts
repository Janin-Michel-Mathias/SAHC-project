import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login returns access token for valid credentials', async () => {
    const user = {
      id: 1,
      email: 'john@test.com',
      password: 'hashed-password',
      role: 'employee',
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue('token-123');

    const result = await service.login('john@test.com', 'plain-password');

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'john@test.com',
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plain-password',
      user.password,
    );
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      email: 'john@test.com',
      role: 'employee',
    });
    expect(result).toEqual({ accessToken: 'token-123' });
  });

  it('login throws UnauthorizedException when user does not exist', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.login('missing@test.com', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(service.login('missing@test.com', 'password')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('login throws UnauthorizedException when password is invalid', async () => {
    mockUserRepository.findOneBy.mockResolvedValue({
      id: 1,
      email: 'john@test.com',
      password: 'hashed-password',
      role: 'employee',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login('john@test.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(service.login('john@test.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('register creates and saves a new user with hashed password', async () => {
    type NewUserInput = {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role: string;
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    mockUserRepository.findOneBy.mockResolvedValue(null);
    mockUserRepository.create.mockImplementation(
      (value: NewUserInput): NewUserInput => value,
    );
    mockUserRepository.save.mockResolvedValue({
      id: 1,
      email: 'new@test.com',
      password: 'hashed-password',
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'employee',
    });

    const result = await service.register(
      'new@test.com',
      'plain-password',
      'Jane',
      'Doe',
      'employee',
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'hashed-password',
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'employee',
    });

    expect(mockUserRepository.save).toHaveBeenCalled();

    expect(result).toEqual({
      id: 1,
      email: 'new@test.com',
      password: 'hashed-password',
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'employee',
    });
  });

  it('register throws UnauthorizedException when email already exists', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    mockUserRepository.findOneBy.mockResolvedValue({
      id: 1,
      email: 'new@test.com',
    });

    await expect(
      service.register(
        'new@test.com',
        'plain-password',
        'Jane',
        'Doe',
        'employee',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      service.register(
        'new@test.com',
        'plain-password',
        'Jane',
        'Doe',
        'employee',
      ),
    ).rejects.toThrow('Email already in use');
  });
});
