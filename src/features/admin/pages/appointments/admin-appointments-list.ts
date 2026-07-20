import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminAppointmentDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-admin-appointments-list',
  imports: [RouterLink, FormsModule, DatePipe, TranslatePipe],
  templateUrl: './admin-appointments-list.html',
  styleUrl: './admin-appointments-list.css',
})
export class AdminAppointmentsList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  readonly appointments = signal<AdminAppointmentDto[]>([]);
  readonly isLoading = signal(true);
  readonly metadata = signal<PaginationMetadata | null>(null);

  searchQuery = '';
  selectedStatus: number | null = null;
  currentPage = 1;
  pageSize = 10;

  readonly totalAppointments = computed(() => this.metadata()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.metadata()?.totalPages ?? 0);

  readonly AppointmentStatus = AppointmentStatus;

  get statusOptions() {
    const { AppointmentStatus } = this;
    return [
      { value: null, label: this.translationService.translate('admin.filter.all') },
      { value: AppointmentStatus.Pending, label: this.translationService.translate('admin.status.pending') },
      { value: AppointmentStatus.Confirmed, label: this.translationService.translate('admin.status.confirmed') },
      { value: AppointmentStatus.Completed, label: this.translationService.translate('admin.status.completed') },
      { value: AppointmentStatus.Cancelled, label: this.translationService.translate('admin.status.cancelled') },
      { value: AppointmentStatus.Rescheduled, label: this.translationService.translate('admin.status.rescheduled') },
    ];
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const statusParam = params.get('status');
      if (statusParam !== null) {
        const parsed = parseInt(statusParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
          this.selectedStatus = parsed;
        }
      }
      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    this.isLoading.set(true);

    this.adminService.getAppointments({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      status: this.selectedStatus ?? undefined,
    }).subscribe({
      next: (res) => {
        if (res.data) {
          this.appointments.set(res.data.items);
          this.metadata.set(res.data.metadata);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onStatusFilter(status: number | null): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadAppointments();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadAppointments();
  }

  getStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      [AppointmentStatus.Pending]: this.translationService.translate('admin.status.pending'),
      [AppointmentStatus.Confirmed]: this.translationService.translate('admin.status.confirmed'),
      [AppointmentStatus.Completed]: this.translationService.translate('admin.status.completed'),
      [AppointmentStatus.Cancelled]: this.translationService.translate('admin.status.cancelled'),
      [AppointmentStatus.Rescheduled]: this.translationService.translate('admin.status.rescheduled'),
    };
    return labels[status] ?? this.translationService.translate('admin.status.unknown');
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      [AppointmentStatus.Pending]: 'status-pending',
      [AppointmentStatus.Confirmed]: 'status-confirmed',
      [AppointmentStatus.Completed]: 'status-completed',
      [AppointmentStatus.Cancelled]: 'status-cancelled',
      [AppointmentStatus.Rescheduled]: 'status-rescheduled',
    };
    return classes[status] ?? 'status-pending';
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.substring(0, 2).toUpperCase();
  }
}
