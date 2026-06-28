import { inject, Injectable, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';
import { AUTH_CONFIG } from '../config/auth.config';

export interface HeaderModel {
  dashboardRoute: string;
  profileRoute: string;
  chatRoute: string;
  notificationsRoute: string;
  appointmentsRoute: string;
  videoRoute: string;
  paymentsRoute: string;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly homeRoute = '/';
  readonly specialistsRoute = '/specialists';
  readonly loginRoute = '/auth/login';
  readonly registerRoute = '/auth/register';

  readonly profileRoute = '/profile';
  readonly chatRoute = '/chat';
  readonly notificationsRoute = '/notifications';
  readonly appointmentsRoute = '/appointments';
  readonly videoRoute = '/video';
  readonly paymentsRoute = '/payments';
  readonly becomeSpecialistRoute = '/become-specialist';

  readonly specialistDashboardRoute = '/specialist/dashboard';
  readonly specialistChatRoute = '/specialist/chat';
  readonly specialistProfileRoute = '/specialist/profile';

  readonly dashboardRoute = computed(() => {
    const role = this.authService.userRole();
    if (role === UserRole.Specialist) return '/specialist/dashboard';
    if (role === UserRole.Admin) return '/admin/dashboard';
    return this.profileRoute;
  });

  readonly headerModel = computed<HeaderModel>(() => ({
    dashboardRoute: this.dashboardRoute(),
    profileRoute: this.profileRoute,
    chatRoute: this.chatRoute,
    notificationsRoute: this.notificationsRoute,
    appointmentsRoute: this.appointmentsRoute,
    videoRoute: this.videoRoute,
    paymentsRoute: this.paymentsRoute,
  }));

  redirectAfterLogin(): void {
    const role = this.authService.userRole();
    if (role !== null && AUTH_CONFIG.defaultRedirectByRole[role]) {
      this.router.navigateByUrl(AUTH_CONFIG.defaultRedirectByRole[role]);
    } else {
      this.router.navigateByUrl(this.homeRoute);
    }
  }

  redirectAfterLogout(): void {
    this.router.navigateByUrl(this.loginRoute);
  }
}
