import { inject, Injectable, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';
import { AUTH_CONFIG } from '../config/auth.config';

export interface DropdownItem {
  label: string;
  route: string;
  icon: string;
  divider?: boolean;
  destructive?: boolean;
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly ROUTES = {
    public: {
      home: '/',
      specialists: '/specialists',
      login: '/auth/login',
      register: '/auth/register',
    },
    user: {
      profile: '/profile',
      chat: '/chat',
      notifications: '/notifications',
      appointments: '/appointments',
      video: '/video',
      payments: '/payments',
      becomeSpecialist: '/become-specialist',
    },
    specialist: {
      dashboard: '/specialist/dashboard',
      chat: '/specialist/chat',
      profile: '/specialist/profile',
      availability: '/specialist/availability',
    },
    admin: {
      dashboard: '/admin/dashboard',
    },
  };

  readonly homeRoute = this.ROUTES.public.home;
  readonly specialistsRoute = this.ROUTES.public.specialists;
  readonly loginRoute = this.ROUTES.public.login;
  readonly registerRoute = this.ROUTES.public.register;

  readonly profileRoute = this.ROUTES.user.profile;
  readonly chatRoute = this.ROUTES.user.chat;
  readonly notificationsRoute = this.ROUTES.user.notifications;
  readonly appointmentsRoute = this.ROUTES.user.appointments;
  readonly videoRoute = this.ROUTES.user.video;
  readonly paymentsRoute = this.ROUTES.user.payments;
  readonly becomeSpecialistRoute = this.ROUTES.user.becomeSpecialist;

  readonly specialistDashboardRoute = this.ROUTES.specialist.dashboard;
  readonly specialistChatRoute = this.ROUTES.specialist.chat;
  readonly specialistProfileRoute = this.ROUTES.specialist.profile;
  readonly specialistAvailabilityRoute = this.ROUTES.specialist.availability;

  readonly dashboardRoute = computed(() => {
    const role = this.authService.userRole();
    if (role === UserRole.Specialist) return this.ROUTES.specialist.dashboard;
    if (role === UserRole.Admin) return this.ROUTES.admin.dashboard;
    return this.ROUTES.user.profile;
  });

  readonly mainNavigation = computed<NavItem[]>(() => {
    const role = this.authService.userRole();

    const items: NavItem[] = [
      { label: 'الرئيسية', route: this.ROUTES.public.home, icon: 'home' },
    ];

    if (role === UserRole.Admin) {
      items.push({ label: 'لوحة التحكم', route: this.ROUTES.admin.dashboard, icon: 'dashboard' });
    } else {
      items.push({ label: 'المتخصصين', route: this.ROUTES.public.specialists, icon: 'specialists' });
      if (role === UserRole.Specialist) {
        items.push({ label: 'لوحة التحكم', route: this.ROUTES.specialist.dashboard, icon: 'dashboard' });
      }
    }

    return items;
  });

  readonly dropdownNavigation = computed<DropdownItem[]>(() => {
    const role = this.authService.userRole();
    const isSpecialist = role === UserRole.Specialist;
    const items: DropdownItem[] = [];

    // if (isSpecialist) {
    //   items.push({
    //     label: 'لوحة التحكم',
    //     route: this.dashboardRoute(),
    //     icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    //   });
    // }

    items.push({
      label: 'الإعدادات والملف الشخصي',
      route: this.ROUTES.user.profile,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    });

    items.push({
      label: 'سجل الحجوزات',
      route: this.ROUTES.user.appointments,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    });

    items.push({
      label: 'جلسات الفيديو',
      route: this.ROUTES.user.video,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    });

    items.push({
      label: 'المعاملات المالية',
      route: this.ROUTES.user.payments,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    });

    if (!isSpecialist) {
      items.push({ label: '', route: '', icon: '', divider: true });
      items.push({
        label: 'انضم كاختصاصي',
        route: this.ROUTES.user.becomeSpecialist,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>',
      });
    }

    items.push({ label: '', route: '', icon: '', divider: true });
    items.push({
      label: 'تسجيل الخروج',
      route: '',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
      destructive: true,
    });

    return items;
  });

  readonly specialistSidebarNavigation = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        label: 'لوحة التحكم',
        route: this.ROUTES.specialist.dashboard,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
      },
      {
        label: 'المواعيد',
        route: this.ROUTES.user.appointments,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      },
      {
        label: 'التوافر',
        route: this.ROUTES.specialist.availability,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      },
      {
        label: 'الرسائل',
        route: this.ROUTES.specialist.chat,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      },
      {
        label: 'المعاملات المالية',
        route: this.ROUTES.user.payments,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
      },
    ];
    return items;
  });

  redirectAfterLogin(): void {
    const role = this.authService.userRole();
    if (role !== null && AUTH_CONFIG.defaultRedirectByRole[role]) {
      this.router.navigateByUrl(AUTH_CONFIG.defaultRedirectByRole[role]);
    } else {
      this.router.navigateByUrl(this.homeRoute);
    }
  }

  redirectAfterLogout(): void {
    this.router.navigateByUrl(this.loginRoute);
  }
}
