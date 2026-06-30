import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/admin-dashboard').then((m) => m.AdminDashboard)
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/admin-users-list').then(m => m.AdminUsersList),
    title: 'إدارة المستخدمين'
  },
  {
    path: 'users/create',
    loadComponent: () => import('./pages/users/admin-user-create').then(m => m.AdminUserCreate),
    title: 'إضافة مستخدم'
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./pages/users/admin-user-detail').then(m => m.AdminUserDetail),
    title: 'تفاصيل المستخدم'
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./pages/users/admin-user-edit').then(m => m.AdminUserEdit),
    title: 'تعديل المستخدم'
  },
  {
    path: 'specialists',
    loadComponent: () => import('./pages/specialists/admin-specialists-list').then(m => m.AdminSpecialistsList),
    title: 'إدارة المتخصصين'
  },
  {
    path: 'specialists/create',
    loadComponent: () => import('./pages/specialists/admin-specialist-create').then(m => m.AdminSpecialistCreate),
    title: 'إضافة متخصص'
  },
  {
    path: 'specialists/:id',
    loadComponent: () => import('./pages/specialists/admin-specialist-detail').then(m => m.AdminSpecialistDetail),
    title: 'تفاصيل المتخصص'
  },
  {
    path: 'specialists/:id/edit',
    loadComponent: () => import('./pages/specialists/admin-specialist-edit').then(m => m.AdminSpecialistEdit),
    title: 'تعديل المتخصص'
  },
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/admin-appointments-list').then(m => m.AdminAppointmentsList),
    title: 'إدارة الحجوزات'
  },
  {
    path: 'appointments/:id',
    loadComponent: () => import('./pages/appointments/admin-appointment-detail').then(m => m.AdminAppointmentDetail),
    title: 'تفاصيل الحجز'
  },
  {
    path: 'lookups',
    loadComponent: () => import('./pages/lookups/admin-lookups').then(m => m.AdminLookups),
    title: 'إدارة البيانات الأساسية'
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./pages/audit-logs/admin-audit-logs').then(m => m.AdminAuditLogs),
    title: 'سجل التدقيق'
  },
  {
    path: 'payments',
    loadComponent: () => import('./pages/payments/admin-payments-list').then(m => m.AdminPaymentsList),
    title: 'المدفوعات'
  },
  {
    path: 'payments/:id',
    loadComponent: () => import('./pages/payments/admin-payment-detail').then(m => m.AdminPaymentDetail),
    title: 'تفاصيل الدفع'
  },
  {
    path: 'ai',
    loadComponent: () => import('./pages/ai/admin-ai').then(m => m.AdminAi),
    title: 'إدارة AI'
  }
];
