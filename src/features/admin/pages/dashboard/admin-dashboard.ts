import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { AdminDashboardDto, AdminUserDto, AdminAppointmentDto } from '../../contracts/admin.contracts';
import { UiDashboardStatCard } from '@shared/ui/dashboard-stat-card/dashboard-stat-card';
import { DatePipe } from '@angular/common';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, UiDashboardStatCard, DatePipe, TranslatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

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
      0: this.translationService.translate('admin.status.pending'),
      1: this.translationService.translate('admin.status.confirmed'),
      2: this.translationService.translate('admin.status.completed'),
      3: this.translationService.translate('admin.status.cancelled'),
      4: this.translationService.translate('admin.status.rescheduled'),
      5: this.translationService.translate('admin.status.paid'),
    };
    return labels[status] ?? this.translationService.translate('admin.status.unknown');
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      0: 'status-pending',
      1: 'status-confirmed',
      2: 'status-completed',
      3: 'status-cancelled',
      4: 'status-rescheduled',
      5: 'status-paid',
    };
    return classes[status] ?? 'status-pending';
  }

  getRoleName(role: number): string {
    const names: Record<number, string> = {
      0: this.translationService.translate('admin.userRole.user'),
      1: this.translationService.translate('admin.userRole.specialist'),
      2: this.translationService.translate('admin.userRole.admin'),
    };
    return names[role] ?? this.translationService.translate('admin.userRole.unknown');
  }
}
