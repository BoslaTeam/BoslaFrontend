import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationService } from '@core/navigation/navigation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-specialist-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './specialist-sidebar.html',
  styleUrl: './specialist-sidebar.css',
})
export class SpecialistSidebar {
  private readonly navigationService = inject(NavigationService);

  readonly isCollapsed = input<boolean>(false);
  readonly isMobileOpen = input<boolean>(false);
  readonly toggleCollapse = output<void>();
  readonly closeMobile = output<void>();

  readonly navItems = this.navigationService.specialistSidebarNavigation;

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeMobile.emit();
    }
  }
}
