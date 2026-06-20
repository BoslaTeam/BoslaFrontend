import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './public-header.html'
})
export class PublicHeader {
  authService = inject(AuthService);
  isScrolled = false;

  get dashboardRoute(): string {
    const role = this.authService.userRole();
    if (role === 1) return '/specialist';
    if (role === 2) return '/admin';
    return '/user';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
