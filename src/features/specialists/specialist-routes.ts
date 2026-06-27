import { Routes } from '@angular/router';
import { SpecialistDashboard } from './pages/specialist-dashboard/specialist-dashboard';

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
];
