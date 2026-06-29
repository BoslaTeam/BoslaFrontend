import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { specialistGuard } from '@core/guards/specialist.guard';

export const SPECIALIST_ROUTES: Routes = [
  {
    path: 'specialist',
    canActivate: [authGuard, specialistGuard],
    loadComponent: () => import('./specialist-layout').then(m => m.SpecialistLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('@features/specialists/specialist-routes').then(m => m.SPECIALIST_PANEL_ROUTES),
      },
      {
        path: 'chat',
        loadChildren: () => import('@features/communications/routes').then(m => m.COMMUNICATIONS_ROUTES),
      },
      {
        path: 'video',
        loadChildren: () => import('@features/video/routes').then(m => m.VIDEO_ROUTES),
      },
    ],
  },
];
