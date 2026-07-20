import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '../navigation/navigation.service';

export const nonSpecialistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService);

  const status = authService.specialistStatus();

  if (status === 'Approved' || status === 'Pending') {
    return router.createUrlTree([navigationService.specialistDashboardRoute]);
  }

  return true;
};
