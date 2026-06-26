import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  { path: 'profile', loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfile) },
  { path: 'specialist-onboarding', loadComponent: () => import('../specialists/pages/onboarding/specialist-onboarding').then(m => m.SpecialistOnboarding) },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];
