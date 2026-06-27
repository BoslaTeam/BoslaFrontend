import { UserRole } from '../enums/user-role.enum';

export const AUTH_CONFIG = {
  accessTokenExpiryMinutes: 15,
  refreshTokenExpiryDays: 7,
  
  defaultRedirectByRole: {
    [UserRole.User]: '/',
    [UserRole.Specialist]: '/specialist/profile',
    [UserRole.Admin]: '/admin/dashboard',
  } as const,
  
  loginRoute: '/auth/login',
  unauthorizedRoute: '/unauthorized',
} as const;