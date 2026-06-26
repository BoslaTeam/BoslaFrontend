import { Routes } from '@angular/router';
import { SpecialistDashboard } from './pages/specialist-dashboard/specialist-dashboard';

export const SPECIALIST_PANEL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
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