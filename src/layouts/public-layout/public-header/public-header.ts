import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UiLogo } from "@shared/ui/logo/logo";

@Component({
  selector: 'app-public-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, UiLogo],
  templateUrl: './public-header.html'
})
export class PublicHeader {
  authService = inject(AuthService);
  isScrolled = false;
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
