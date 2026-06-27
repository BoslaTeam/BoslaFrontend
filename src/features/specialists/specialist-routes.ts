import { Routes } from '@angular/router';

export const SPECIALIST_PANEL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/specialist-profile/specialist-profile')
        .then(m => m.SpecialistProfilePage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/specialist-onboarding')
        .then(m => m.SpecialistOnboardingPage),
  },
];
