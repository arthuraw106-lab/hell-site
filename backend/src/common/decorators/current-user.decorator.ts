import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../types/request-user.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
