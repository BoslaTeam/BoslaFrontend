import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/home/pages/home/home').then(m => m.Home) },
      // Add other authenticated routes here later
    ]
  },
  {
    path: 'auth',
    component: PublicLayout,
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  { path: '**', redirectTo: '' }
];
