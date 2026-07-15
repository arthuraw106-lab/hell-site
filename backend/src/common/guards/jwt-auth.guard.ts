import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtService = new JwtService();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('توکن ارسال نشده است.');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request.user = {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles?.length && !requiredRoles.includes(request.user.role)) {
        throw new ForbiddenException('دسترسی غیرمجاز است.');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده است.');
    }
  }
}
