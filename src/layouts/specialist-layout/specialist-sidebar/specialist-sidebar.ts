import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-specialist-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './specialist-sidebar.html',
  styleUrl: './specialist-sidebar.css',
})
export class SpecialistSidebar {
  readonly isCollapsed = input<boolean>(false);
  readonly isMobileOpen = input<boolean>(false);
  readonly toggleCollapse = output<void>();
  readonly closeMobile = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'لوحة التحكم', route: '/specialist/dashboard', icon: 'dashboard' },
    { label: 'المواعيد', route: '/specialist/appointments', icon: 'appointments' },
    { label: 'التوافر', route: '/specialist/availability', icon: 'availability' },
    { label: 'الرسائل', route: '/specialist/chat', icon: 'chat' },
    { label: 'الملف الشخصي', route: '/specialist/profile', icon: 'profile' },
  ];

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeMobile.emit();
    }
  }
}
