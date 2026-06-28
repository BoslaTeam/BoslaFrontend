import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, CommonModule],
  templateUrl: './mobile-menu.html'
})
export class MobileMenu {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);
  readonly isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-mobile-menu]')) {
      this.close();
    }
  }
}
