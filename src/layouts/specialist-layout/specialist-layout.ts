import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SpecialistHeader } from './specialist-header/specialist-header';
import { SpecialistSidebar } from './specialist-sidebar/specialist-sidebar';
import { SpecialistShellService } from './services/specialist-shell.service';

@Component({
  selector: 'app-specialist-layout',
  imports: [RouterOutlet, SpecialistHeader, SpecialistSidebar],
  templateUrl: './specialist-layout.html',
})
export class SpecialistLayout {
  private readonly shellService = inject(SpecialistShellService);

  readonly sidebarCollapsed = signal(false);
  readonly sidebarMobileOpen = signal(false);

  constructor() {
    this.shellService.bootstrap();
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 1024) {
      this.sidebarMobileOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }

  closeMobileSidebar(): void {
    this.sidebarMobileOpen.set(false);
  }
}
