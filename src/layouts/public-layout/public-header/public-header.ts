import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/user-role.enum';
import { UiLogo } from "@shared/ui/logo/logo";

@Component({
  selector: 'app-public-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, UiLogo],
  templateUrl: './public-header.html'
})
export class PublicHeader {
  authService = inject(AuthService);
  router = inject(Router);

  isScrolled = false;
  avatarError = false;


  isDropdownOpen = signal(false);

  get dashboardRoute(): string {
    const role = this.authService.userRole();
    if (role === UserRole.Specialist) return '/specialist';
    if (role === UserRole.Admin) return '/admin';
    return '/user';
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
    this.avatarError = true;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }


  get isSolidBackground(): boolean {
    return this.isScrolled || this.router.url !== '/';
  }
}
