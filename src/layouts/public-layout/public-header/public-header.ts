import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiLogo } from "@shared/ui/logo/logo";
import { MainNavigation } from './main-navigation/main-navigation';
import { HeaderActions } from './header-actions/header-actions';
import { MobileMenu } from './mobile-menu/mobile-menu';

@Component({
  selector: 'app-public-header',
  imports: [CommonModule, UiLogo, MainNavigation, HeaderActions, MobileMenu],
  templateUrl: './public-header.html'
})
export class PublicHeader {
  router = inject(Router);
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  get isSolidBackground(): boolean {
    return this.isScrolled || this.router.url !== '/';
  }
}
