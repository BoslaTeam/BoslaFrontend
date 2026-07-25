import { Component, HostListener, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UiLogo } from '@shared/ui/logo/logo';
import { NavigationService } from '@core/navigation/navigation.service';
import { MainNavigation } from '@layouts/shared/main-navigation/main-navigation';
import { HeaderActions } from '@layouts/shared/header-actions/header-actions';
import { MobileMenu } from '@layouts/shared/mobile-menu/mobile-menu';

@Component({
  selector: 'app-app-header',
  imports: [CommonModule, RouterLink, UiLogo, MainNavigation, HeaderActions, MobileMenu],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
  host: { class: 'header-host' }
})
export class AppHeader {
  @Input() variant: 'public' | 'dashboard' = 'public';
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  private readonly router = inject(Router);
  readonly navigationService = inject(NavigationService);

  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  get isSolidBackground(): boolean {
    return this.variant === 'dashboard' || this.isScrolled || this.router.url !== '/';
  }
}
