import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminAppointmentDetailDto } from '../../contracts/admin.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-admin-appointment-detail',
  imports: [DatePipe, SlicePipe, FormsModule, TranslatePipe],
  templateUrl: './admin-appointment-detail.html',
  styleUrl: './admin-appointment-detail.css',
})
export class AdminAppointmentDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  readonly id = input.required<string>();

  readonly appointment = signal<AdminAppointmentDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isCancelling = signal(false);
  readonly isUpdating = signal(false);
  readonly showCancelModal = signal(false);
  cancelReason = '';

  ngOnInit(): void {
    this.loadAppointment();
  }

  loadAppointment(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getAppointmentDetail(this.id()).subscribe({
      next: (data) => {
        this.appointment.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  confirmAppointment(): void {
    this.isUpdating.set(true);
    this.adminService.confirmAppointment(this.id()).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.loadAppointment();
      },
      error: () => this.isUpdating.set(false),
    });
  }

  completeAppointment(): void {
    this.isUpdating.set(true);
    this.adminService.completeAppointment(this.id()).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.loadAppointment();
      },
      error: () => this.isUpdating.set(false),
    });
  }

  confirmCancel(): void {
    if (!this.cancelReason.trim()) return;
    this.isCancelling.set(true);

    this.adminService.cancelAppointment(this.id(), this.cancelReason).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.showCancelModal.set(false);
        this.cancelReason = '';
        this.loadAppointment();
      },
      error: () => {
        this.isCancelling.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: this.translationService.translate('admin.status.pending'),
      Confirmed: this.translationService.translate('admin.status.confirmed'),
      Completed: this.translationService.translate('admin.status.completed'),
      Cancelled: this.translationService.translate('admin.status.cancelled'),
      Rescheduled: this.translationService.translate('admin.status.rescheduled'),
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'status-pending',
      Confirmed: 'status-confirmed',
      Completed: 'status-completed',
      Cancelled: 'status-cancelled',
      Rescheduled: 'status-rescheduled',
    };
    return classes[status] ?? 'status-pending';
  }

  getPaymentStatusLabel(status: string | undefined): string {
    const labels: Record<string, string> = {
      Pending: this.translationService.translate('admin.status.pending'),
      Completed: this.translationService.translate('admin.status.completed'),
      Failed: this.translationService.translate('admin.status.failed'),
      Refunded: this.translationService.translate('admin.status.refunded'),
    };
    return status ? (labels[status] ?? status) : '—';
  }

  goBack(): void {
    this.router.navigate(['/admin/appointments']);
  }
}
