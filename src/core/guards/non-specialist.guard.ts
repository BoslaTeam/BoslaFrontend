import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';
import { NavigationService } from '../navigation/navigation.service';

export const nonSpecialistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService);

  if (authService.hasRole(UserRole.Specialist)) {
    return router.createUrlTree([navigationService.specialistDashboardRoute]);
  }

  return true;
};
