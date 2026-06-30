import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { UiButton } from '@shared/ui/button/button';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, DatePipe],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css',
})
export class AppointmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(AppointmentsStore);

  readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

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

  getStatusDetails(status: AppointmentStatus | undefined): { text: string; classes: string; dot: string } {
    if (status === undefined) return { text: '', classes: '', dot: '' };
    switch (status) {
      case AppointmentStatus.Pending:
        return { text: 'قيد الانتظار', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case AppointmentStatus.Confirmed:
        return { text: 'مؤكدة', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case AppointmentStatus.Completed:
        return { text: 'مكتملة', classes: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغية', classes: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      default:
        return { text: 'غير معروف', classes: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
    }
  }
}
