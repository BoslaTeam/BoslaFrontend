import { Routes } from '@angular/router';
import { SpecialistDashboard } from './pages/specialist-dashboard/specialist-dashboard';

export const SPECIALISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/specialist-list/specialist-list')
        .then(m => m.SpecialistListPage)
  },

  {
    path: 'dashboard',
    component: SpecialistDashboard
  },

  {
    path: ':id',
    loadComponent: () =>
      import('./pages/specialist-details/specialist-details')
        .then(m => m.SpecialistDetailsPage)
  }
];