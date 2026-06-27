import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  isScrolled = false;
  avatarError = false;

  get dashboardRoute(): string {
    const role = this.authService.userRole();
    if (role === UserRole.Specialist) return '/specialist';
    if (role === UserRole.Admin) return '/admin';
    return '/user';
  }

  onAvatarError() {
    this.avatarError = true;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
