import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';
import { AUTH_CONFIG } from '../config/auth.config';

export const specialistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole(UserRole.Specialist)) return true;

  return router.createUrlTree([AUTH_CONFIG.unauthorizedRoute]);
};