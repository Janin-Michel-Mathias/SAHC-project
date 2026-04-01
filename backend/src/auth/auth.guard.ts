import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './current-user.decorator';

export type UserRole = 'employee' | 'secretary' | 'manager';

const ALL_ROLES: UserRole[] = ['employee', 'secretary', 'manager'];

export function AuthGuard(...requiredRoles: UserRole[]): Type<CanActivate> {
  @Injectable()
  class RoleAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.headers.authorization?.split(' ')[1];

      if (!token) throw new UnauthorizedException('No token provided');

      const rolesToCheck = requiredRoles.length ? requiredRoles : ALL_ROLES;

      try {
        const payload = this.jwtService.verify<JwtPayload>(token);

        if (!rolesToCheck.includes(payload.role as UserRole)) {
          throw new ForbiddenException('Insufficient role permissions');
        }

        request['user'] = payload;
        return true;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }

        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }

  return mixin(RoleAuthGuard);
}
