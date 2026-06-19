import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { guestGuard } from '../core/guards/guest.guard';
import { adminGuard } from '../core/guards/admin.guard';
import { specialistGuard } from '../core/guards/specialist.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@layouts/public-layout/public-layout/public-layout').then(
        (m) => m.PublicLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/home/routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'specialists',
        loadChildren: () =>
          import('@features/specialists/routes').then((m) => m.SPECIALISTS_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@layouts/public-layout/public-layout/public-layout').then(
        (m) => m.PublicLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/auth/routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@layouts/user-layout/user-layout/user-layout').then(
        (m) => m.UserLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/users/routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('@features/appointments/routes').then((m) => m.APPOINTMENTS_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('@features/payments/routes').then((m) => m.PAYMENTS_ROUTES),
      },
      {
        path: 'chat',
        loadChildren: () => import('@features/chat/routes').then((m) => m.CHAT_ROUTES),
      },
      {
        path: 'video',
        loadChildren: () => import('@features/video/routes').then((m) => m.VIDEO_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('@features/notifications/routes').then((m) => m.NOTIFICATIONS_ROUTES),
      },
    ],
  },
  {
    path: 'specialist',
    canActivate: [authGuard, specialistGuard],
    loadComponent: () =>
      import('@layouts/specialist-layout/specialist-layout/specialist-layout').then(
        (m) => m.SpecialistLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@features/specialists/specialist-routes').then(
            (m) => m.SPECIALIST_PANEL_ROUTES,
          ),
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('@features/appointments/routes').then((m) => m.APPOINTMENTS_ROUTES),
      },
      {
        path: 'chat',
        loadChildren: () => import('@features/chat/routes').then((m) => m.CHAT_ROUTES),
      },
      {
        path: 'video',
        loadChildren: () => import('@features/video/routes').then((m) => m.VIDEO_ROUTES),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@layouts/admin-layout/admin-layout/admin-layout').then(
        (m) => m.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/admin/routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('@shared/components/error-pages/unauthorized/unauthorized').then(
        (m) => m.Unauthorized,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/error-pages/not-found/not-found').then(
        (m) => m.NotFound,
      ),
  },
];