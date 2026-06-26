import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminUserDetailDto } from '../../contracts/admin.contracts';

@Component({
  selector: 'app-admin-user-detail',
  imports: [DatePipe],
  templateUrl: './admin-user-detail.html',
  styleUrl: './admin-user-detail.css',
})
export class AdminUserDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly user = signal<AdminUserDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly activeTab = signal<'info' | 'education' | 'social' | 'activity'>('info');
  readonly isToggling = signal(false);

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getUserDetail(this.id()).subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: 'info' | 'education' | 'social' | 'activity'): void {
    this.activeTab.set(tab);
  }

  toggleUserStatus(): void {
    const u = this.user();
    if (!u) return;

    this.isToggling.set(true);
    const action$ = u.isActive
      ? this.adminService.deactivateUser(u.id)
      : this.adminService.reactivateUser(u.id);

    action$.subscribe({
      next: () => {
        this.user.set({ ...u, isActive: !u.isActive });
        this.isToggling.set(false);
      },
      error: () => {
        this.isToggling.set(false);
      },
    });
  }

  getRoleName(role: number): string {
    const names: Record<number, string> = {
      0: 'مستخدم',
      1: 'متخصص',
      2: 'مدير',
    };
    return names[role] ?? 'غير معروف';
  }

  getRoleClass(role: number): string {
    const classes: Record<number, string> = {
      0: 'role-user',
      1: 'role-specialist',
      2: 'role-admin',
    };
    return classes[role] ?? 'role-user';
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  }

  getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      linkedin: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
      twitter: 'M22 4.01c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C17.97 2.48 16.85 2 15.58 2c-2.44 0-4.42 2.02-4.42 4.51 0 .35.04.7.11 1.03-3.67-.19-6.93-1.98-9.11-4.71-.38.67-.6 1.45-.6 2.28 0 1.57.78 2.95 1.96 3.76-.72-.02-1.4-.22-2-.56v.06c0 2.19 1.53 4.01 3.56 4.42-.37.1-.76.16-1.17.16-.28 0-.56-.03-.83-.08.57 1.81 2.22 3.13 4.17 3.17-1.53 1.22-3.45 1.95-5.54 1.95-.36 0-.71-.02-1.06-.06 1.97 1.29 4.31 2.04 6.83 2.04 8.2 0 12.68-6.93 12.68-12.94 0-.2 0-.39-.01-.59.87-.64 1.63-1.44 2.23-2.35z',
      github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
    };
    return icons[platform.toLowerCase()] ?? '';
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
