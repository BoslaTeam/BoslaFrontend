import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { nonSpecialistGuard } from '@core/guards/non-specialist.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/home/routes').then(m => m.HOME_ROUTES),
      },
      {
        path: 'specialists',
        loadChildren: () => import('@features/specialists/routes').then(m => m.SPECIALISTS_ROUTES),
      },
      {
        path: 'auth',
        canActivate: [guestGuard],
        loadChildren: () => import('@features/auth/routes').then(m => m.AUTH_ROUTES),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('@features/profile/pages/profile-page/profile-page').then(m => m.ProfilePage),
      },
      {
        path: 'appointments',
        canActivate: [authGuard],
        loadChildren: () => import('@features/appointments/routes').then(m => m.APPOINTMENTS_ROUTES),
      },
      {
        path: 'payments',
        canActivate: [authGuard],
        loadChildren: () => import('@features/payments/routes').then(m => m.PAYMENTS_ROUTES),
      },
      {
        path: 'chat',
        canActivate: [authGuard],
        loadChildren: () => import('@features/communications/routes').then(m => m.COMMUNICATIONS_ROUTES),
      },
      {
        path: 'video',
        canActivate: [authGuard],
        loadChildren: () => import('@features/video/routes').then(m => m.VIDEO_ROUTES),
      },
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadChildren: () => import('@features/notifications/routes').then(m => m.NOTIFICATIONS_ROUTES),
      },
      {
        path: 'become-specialist',
        canActivate: [authGuard, nonSpecialistGuard],
        loadComponent: () => import('@features/specialists/pages/onboarding/specialist-onboarding').then(m => m.SpecialistOnboardingPage),
      },
    ],
  },
];
