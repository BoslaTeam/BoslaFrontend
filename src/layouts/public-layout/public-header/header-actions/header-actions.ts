import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { UserDropdown } from '../user-dropdown/user-dropdown';

@Component({
  selector: 'app-header-actions',
  imports: [RouterLink, CommonModule, UserDropdown],
  templateUrl: './header-actions.html'
})
export class HeaderActions {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);

  avatarError = false;
  isDropdownOpen = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.closeDropdown();
    }
  }

  onAvatarError() {
    this.avatarError = true;
  }
}
