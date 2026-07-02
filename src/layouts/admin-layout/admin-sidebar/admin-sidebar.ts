import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  private readonly authService = inject(AuthService);

  readonly isCollapsed = input<boolean>(false);
  readonly isMobileOpen = input<boolean>(false);
  readonly toggleCollapse = output<void>();
  readonly closeMobile = output<void>();

  readonly currentUser = this.authService.currentUser;

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.fullName ?? '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase() || 'AD';
  });

  readonly navSections: NavSection[] = [
    {
      title: 'الرئيسية',
      items: [
        { label: 'لوحة التحكم', route: '/admin/dashboard', icon: 'dashboard' },
      ],
    },
    {
      title: 'الإدارة',
      items: [
        { label: 'المستخدمون', route: '/admin/users', icon: 'users' },
        { label: 'المتخصصون', route: '/admin/specialists', icon: 'specialists' },
        { label: 'الحجوزات', route: '/admin/appointments', icon: 'appointments' },
        { label: 'المدفوعات', route: '/admin/payments', icon: 'payments' },
        { label: 'السحوبات', route: '/admin/withdrawals', icon: 'payments' },
      ],
    },
    {
      title: 'النظام',
      items: [
        { label: 'البيانات الأساسية', route: '/admin/lookups', icon: 'lookups' },
        { label: 'سجل التدقيق', route: '/admin/audit-logs', icon: 'audit' },
        { label: 'إدارة AI', route: '/admin/ai', icon: 'ai' },
      ],
    },
  ];

  onLogout(): void {
    this.authService.logout();
  }

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeMobile.emit();
    }
  }
}
