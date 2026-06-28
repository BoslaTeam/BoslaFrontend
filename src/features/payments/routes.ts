import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/my-payments/my-payments').then(m => m.MyPayments) }
];
