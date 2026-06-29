import { Routes } from '@angular/router';

export const ABOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPage),
  },
];
