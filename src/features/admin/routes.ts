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
  }
];
