import { Component, output, inject, signal, computed, HostListener } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { NotificationDropdown } from '@layouts/shared/notification-dropdown/notification-dropdown';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { LanguageToggle } from '@shared/ui/language-toggle/language-toggle';
@Component({
  selector: 'app-admin-header',
  imports: [NotificationDropdown, LanguageToggle, TranslatePipe],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css',
})
export class AdminHeader {
  private readonly authService = inject(AuthService);
  readonly notificationService = inject(NotificationService);

  readonly toggleSidebar = output<void>();
  readonly dropdownOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  toggleNotif(): void {
    this.notifOpen.update((v) => !v);
  }

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.fullName ?? '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase() || 'AD';
  });

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-dropdown-wrapper')) {
      this.dropdownOpen.set(false);
    }
  }

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.authService.logout();
  }
}
