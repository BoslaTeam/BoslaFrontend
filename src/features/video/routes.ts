import { Routes } from '@angular/router';

export const VIDEO_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () =>
      import('./components/video-room/video-room').then((m) => m.VideoRoom),
  },
];
