import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/my-payments/my-payments').then(m => m.MyPayments) },
  { path: 'success', loadComponent: () => import('./pages/payment-success/payment-success').then(m => m.PaymentSuccess) },
  { path: 'cancel', loadComponent: () => import('./pages/payment-cancel/payment-cancel').then(m => m.PaymentCancel) },
  { path: 'dispute/:id', loadComponent: () => import('./pages/file-dispute/file-dispute').then(m => m.FileDispute) },
];
