import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { UiLogo } from '@shared/ui/logo/logo';

@Component({
  selector: 'app-specialist-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, UiLogo],
  templateUrl: './specialist-header.html',
})
export class SpecialistHeader {
  protected readonly authService = inject(AuthService);
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
    if (!target.closest('.specialist-dropdown-container')) {
      this.closeDropdown();
    }
  }

  onAvatarError() {
    this.avatarError = true;
  }

  logout() {
    this.authService.logout();
  }
}
