import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/appointments-list/appointments-list').then((m) => m.AppointmentList),
        title: 'مواعيدي | بوصلة',
      },
      {
        path: 'book',
        loadComponent: () =>
          import('./pages/book-appointment/book-appointment').then(
            (m) => m.BookAppointment,
          ),
        title: 'حجز موعد جديد | بوصلة',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/appointments-details/appointment-details').then(
            (m) => m.AppointmentDetail,
          ),
        title: 'تفاصيل الموعد | بوصلة',
      },
    ],
  },
];
