import { Routes } from '@angular/router';

export const SPECIALIST_PANEL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/specialist-profile/specialist-profile').then(m => m.SpecialistProfile) }
];
