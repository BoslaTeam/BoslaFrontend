import { UserRole } from '../enums/user-role.enum';
import { roleGuard } from './role-guard.helper';

export const specialistGuard = roleGuard([UserRole.Specialist]);
