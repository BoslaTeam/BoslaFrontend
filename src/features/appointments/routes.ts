import { Routes } from '@angular/router';

export const APPOINTMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/my-appointments/my-appointments').then(m => m.MyAppointments) }
];
