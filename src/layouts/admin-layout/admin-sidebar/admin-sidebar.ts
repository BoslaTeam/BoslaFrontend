import { Component, inject, input, output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

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
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  private readonly authService = inject(AuthService);
  private readonly tService = inject(TranslationService);

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

  readonly navSections = computed<NavSection[]>(() => {
    this.tService.currentLang();
    const t = (key: string) => this.tService.translate(key);
    return [
      {
        title: t('admin.sidebar.dashboard'),
        items: [
          { label: t('admin.sidebar.dashboard'), route: '/admin/dashboard', icon: 'dashboard' },
        ],
      },
      {
        title: t('admin.sidebar.management'),
        items: [
          { label: t('admin.sidebar.users'), route: '/admin/users', icon: 'users' },
          { label: t('admin.sidebar.specialists'), route: '/admin/specialists', icon: 'specialists' },
          { label: t('admin.sidebar.appointments'), route: '/admin/appointments', icon: 'appointments' },
          { label: t('admin.sidebar.payments'), route: '/admin/payments', icon: 'payments' },
          { label: t('admin.sidebar.disputes'), route: '/admin/payments/disputes', icon: 'payments' },
          { label: t('admin.sidebar.withdrawals'), route: '/admin/withdrawals', icon: 'withdrawals' },
          { label: t('admin.sidebar.wallet'), route: '/admin/wallet', icon: 'wallet' },
        ],
      },
      {
        title: t('admin.sidebar.system'),
        items: [
          { label: t('admin.sidebar.lookups'), route: '/admin/lookups', icon: 'lookups' },
          { label: t('admin.sidebar.audit'), route: '/admin/audit-logs', icon: 'audit' },
          { label: t('admin.sidebar.ai'), route: '/admin/ai', icon: 'ai' },
        ],
      },
    ];
  });

  onLogout(): void {
    this.authService.logout();
  }

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeMobile.emit();
    }
  }
}
