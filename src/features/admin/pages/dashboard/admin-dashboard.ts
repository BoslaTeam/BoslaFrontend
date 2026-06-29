import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '@core/services/auth.service';
import { AdminDashboardDto, AdminUserDto, AdminAppointmentDto } from '../../contracts/admin.contracts';
import { UiDashboardStatCard } from '@shared/ui/dashboard-stat-card/dashboard-stat-card';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, UiDashboardStatCard, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  readonly stats = signal<AdminDashboardDto | null>(null);

  readonly today = new Date();

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  formatTrend(value: number): string {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  }

  getTrendDirection(value: number): 'up' | 'down' | 'none' {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'none';
  }

  getStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'معلق',
      1: 'مؤكد',
      2: 'مكتمل',
      3: 'ملغي',
      4: 'مرفوض',
    };
    return labels[status] ?? 'غير معروف';
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      0: 'status-pending',
      1: 'status-confirmed',
      2: 'status-completed',
      3: 'status-cancelled',
      4: 'status-rejected',
    };
    return classes[status] ?? 'status-pending';
  }

  getRoleName(role: number): string {
    const names: Record<number, string> = {
      0: 'مستخدم',
      1: 'متخصص',
      2: 'مدير',
    };
    return names[role] ?? 'غير معروف';
  }
}
