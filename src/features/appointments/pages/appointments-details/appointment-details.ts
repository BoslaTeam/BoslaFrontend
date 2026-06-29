import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner],
  templateUrl: './appointment-details.html',
})
export class AppointmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(AppointmentsStore);

  private readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly showCancelModal = signal(false);
  readonly cancelReason = signal('');

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
          classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'مؤكدة',
          classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        };
      case AppointmentStatus.Completed:
        return { text: 'مكتملة', classes: 'bg-bosla-blue/10 text-bosla-blue border-bosla-blue/20' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغية', classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default:
        return { text: 'غير معروف', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }
}
