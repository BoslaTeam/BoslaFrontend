import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';

export const specialistGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authService.isAuthenticated() && tokenService.getRoleFromToken() === 'specialist') {
    return true;
  }

  return router.createUrlTree(['/']);
};
