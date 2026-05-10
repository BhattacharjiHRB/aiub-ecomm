import { SetMetadata } from '@nestjs/common';
import { userRole } from 'src/db/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: userRole[]) => SetMetadata(ROLES_KEY, roles);
