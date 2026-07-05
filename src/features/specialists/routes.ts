import { Routes } from '@angular/router';

export const SPECIALISTS_ROUTES: Routes = [
  {
    path: 'favorites',
    loadComponent: () =>
      import('@features/favorites/pages/my-favorites/my-favorites')
        .then(m => m.MyFavoritesPage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/specialist-list/specialist-list')
        .then(m => m.SpecialistListPage)
  },
  {
    path: ':id/portfolio/:itemId',
    loadComponent: () =>
      import('./pages/portfolio-item-detail/portfolio-item-detail')
        .then(m => m.PortfolioItemDetail)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/specialist-details/specialist-details')
        .then(m => m.SpecialistDetailsPage)
  }
];