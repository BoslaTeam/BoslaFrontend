import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [

  {
    path: 'test',
    loadComponent: () => import('./pages/test-components/test-components').then(m => m.TestComponents)
  },

  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  
];
