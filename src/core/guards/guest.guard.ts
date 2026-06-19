import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AUTH_CONFIG } from '../config/auth.config';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const role = authService.userRole();

  if (role !== null && role !== undefined) {
    const redirectPath = AUTH_CONFIG.defaultRedirectByRole[role];
    if (redirectPath) {
      return router.createUrlTree([redirectPath]);
    }
  }

  return router.createUrlTree(['/']);
};