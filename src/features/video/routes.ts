import { Routes } from '@angular/router';

export const VIDEO_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/my-video-sessions/my-video-sessions').then(m => m.MyVideoSessions) }
];
