import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/admin/routes').then(m => m.ADMIN_ROUTES),
      },
    ],
  },
];
