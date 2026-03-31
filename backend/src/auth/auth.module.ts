import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { databaseProviders } from '../database.providers';
import { userProviders } from '../users/users.providers';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  exports: [JwtModule, AuthGuard],
  controllers: [AuthController],
  providers: [...databaseProviders, ...userProviders, AuthService, AuthGuard],
})
export class AuthModule {}
