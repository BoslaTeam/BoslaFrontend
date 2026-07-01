import { Component, OnInit, inject, signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { AppointmentPaymentStatus } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner],
  templateUrl: './appointment-details.html',
})
export class AppointmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(AppointmentsStore);
  readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly showCancelModal = signal(false);
  readonly cancelReason = signal('');

  readonly userRole = computed(() => this.authService.userRole());
  readonly UserRole = UserRole;
  readonly AppointmentStatus = AppointmentStatus;
  readonly AppointmentPaymentStatus = AppointmentPaymentStatus;

  constructor() {

    effect(() => {
      this.store.selectedItem();
      this.store.isLoading();
      this.store.selectedSpecialistDetail();
      this.store.isLoadingSpecialist();

      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    if (this.appointmentId) {
      this.store.loadAppointmentDetails(this.appointmentId);
    }
  }

  onConfirm(): void {
    this.store.confirmAppointment(this.appointmentId);
  }

  onComplete(): void {
    this.store.completeAppointment(this.appointmentId);
  }

  onCancelSubmit(): void {
    if (!this.cancelReason().trim()) return;
    this.store.cancelAppointment(this.appointmentId, { reason: this.cancelReason() });
    this.showCancelModal.set(false);
    this.cancelReason.set('');
  }

  getStatusLabel(status: AppointmentStatus | undefined) {
    if (status === undefined) return { text: '', classes: '' };
    switch (status) {
      case AppointmentStatus.Pending:
        return {
          text: 'قيد الانتظار',
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'مؤكدة',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case AppointmentStatus.Completed:
        return { text: 'مكتملة', classes: 'bg-bosla-blue/10 text-bosla-blue border-bosla-blue/20' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغية', classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default:
        return { text: 'غير معروف', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }

  getPaymentStatusLabel(status: AppointmentPaymentStatus | undefined): { text: string; classes: string } {
    switch (status) {
      case AppointmentPaymentStatus.Unpaid:
        return { text: 'غير مدفوع', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case AppointmentPaymentStatus.Paid:
        return {
          text: 'مدفوع',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case AppointmentPaymentStatus.Refunded:
        return { text: 'مسترجع', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      default:
        return { text: 'غير محدد', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }
}
