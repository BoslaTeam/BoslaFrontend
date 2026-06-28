import { Routes } from '@angular/router';
import { nonSpecialistGuard } from '../../core/guards/non-specialist.guard';

export const USERS_ROUTES: Routes = [
  {
    path: 'profile',
    canActivate: [nonSpecialistGuard],
    loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfile),
  },  
  {
    path: 'specialist-onboarding',
    loadComponent: () => import('../specialists/pages/onboarding/specialist-onboarding').then(m => m.SpecialistOnboardingPage),
  },
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
];
