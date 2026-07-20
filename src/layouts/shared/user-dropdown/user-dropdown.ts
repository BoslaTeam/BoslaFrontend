import { Component, HostListener, inject, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-dropdown',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './user-dropdown.html'
})
export class UserDropdown {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);

  readonly dropdownModel = this.navigationService.dropdownNavigation;

  isDropdownOpen = signal(false);
  avatarError = signal(false);

  constructor() {
    effect(() => {
      this.authService.currentUser()?.avatarUrl;
      this.avatarError.set(false);
    });
  }

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
    this.avatarError.set(true);
  }

  logout() {
    this.authService.logout();
  }
}
