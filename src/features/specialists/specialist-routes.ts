import { Routes } from '@angular/router';
import { SpecialistDashboard } from './pages/specialist-dashboard/specialist-dashboard';
import { nonSpecialistGuard } from '@core/guards/non-specialist.guard';

export const SPECIALIST_PANEL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@features/profile/pages/profile-page/profile-page')
        .then(m => m.ProfilePage),
  },
  {
    path: 'onboarding',
    canActivate: [nonSpecialistGuard],
    loadComponent: () =>
      import('./pages/onboarding/specialist-onboarding')
        .then(m => m.SpecialistOnboardingPage),
  },
  {
    path: 'dashboard',
    component: SpecialistDashboard,
  },

  {
    path: 'appointments',
    loadComponent: () =>
      import('./pages/specialist-appointments/specialist-appointments')
        .then(m => m.SpecialistAppointments),
  },

  {
    path: 'availability',
    loadComponent: () =>
      import('./pages/specialist-availability/specialist-availability')
        .then(m => m.SpecialistAvailability),
  },
  {
    path: 'profile-management',
    loadComponent: () =>
      import('./pages/specialist-profile-management/specialist-profile-management')
        .then(m => m.SpecialistProfileManagement),
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./pages/specialist-wallet/specialist-wallet')
        .then(m => m.SpecialistWallet),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./pages/specialist-portfolio/specialist-portfolio')
        .then(m => m.SpecialistPortfolio),
  },
];
