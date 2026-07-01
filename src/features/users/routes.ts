import { Routes } from '@angular/router';
import { nonSpecialistGuard } from '../../core/guards/non-specialist.guard';

export const USERS_ROUTES: Routes = [
  {
    path: 'profile',
    canActivate: [nonSpecialistGuard],
    loadComponent: () => import('@features/profile/pages/profile-page/profile-page').then(m => m.ProfilePage),
  },  
  {
    path: 'specialist-onboarding',
    canActivate: [nonSpecialistGuard],
    loadComponent: () => import('../specialists/pages/onboarding/specialist-onboarding').then(m => m.SpecialistOnboardingPage),
  },
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
];
