import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { PUBLIC_ROUTES } from '@layouts/public-layout/public.routes';
import { SPECIALIST_ROUTES } from '@layouts/specialist-layout/specialist.routes';
import { ADMIN_ROUTES } from '@layouts/admin-layout/admin.routes';

export const routes: Routes = [
  {
    path: 'video/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/video/components/video-room/video-room').then(m => m.VideoRoom),
  },
  ...PUBLIC_ROUTES,
  ...SPECIALIST_ROUTES,
  ...ADMIN_ROUTES,
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
