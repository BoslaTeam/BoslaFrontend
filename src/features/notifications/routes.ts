import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/notifications-list/notifications-list').then(m => m.NotificationsList) }
];
