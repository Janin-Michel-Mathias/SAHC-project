import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: string,
  ) {
    if (role !== 'employee' && role !== 'manager' && role !== 'secretary') {
      throw new UnauthorizedException('Invalid role');
    }

    const hashed = await bcrypt.hash(password, 10);
    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const user = this.userRepository.create({
      email,
      password: hashed,
      first_name,
      last_name,
      role,
    });
    return this.userRepository.save(user);
  }
}
