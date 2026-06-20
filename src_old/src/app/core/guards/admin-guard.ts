import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authService.isAuthenticated() && tokenService.getRoleFromToken() === 'admin') {
    return true;
  }

  return router.createUrlTree(['/']);
};
