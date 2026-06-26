import { Routes } from '@angular/router';

export const SPECIALISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/specialist-list/specialist-list')
        .then(m => m.SpecialistListPage)
  },


  {
    path: ':id',
    loadComponent: () =>
      import('./pages/specialist-details/specialist-details')
        .then(m => m.SpecialistDetailsPage)
  }
];