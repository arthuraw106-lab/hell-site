import { Role } from '@prisma/client';

export type RequestUser = {
  sub: string;
  username: string;
  role: Role;
};
