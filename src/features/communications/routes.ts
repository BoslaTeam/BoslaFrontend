import { Routes } from '@angular/router';

export const COMMUNICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/messaging/messaging-page').then((m) => m.MessagingPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/messaging/messaging-page').then((m) => m.MessagingPage),
  },
];

export const CHAT_ROUTES = COMMUNICATIONS_ROUTES;
