import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

export type AppointmentTab = 'upcoming' | 'past';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner],
  templateUrl: './appointments-list.html',
})
export class AppointmentList implements OnInit {
  readonly store = inject(AppointmentsStore);

  readonly activeTab = signal<AppointmentTab>('upcoming');

  readonly filteredAppointments = computed(() => {
    const allAppointments = this.store.items();
    const now = new Date();

    if (this.activeTab() === 'upcoming') {
      return allAppointments.filter(
        (app) =>
          app.status === AppointmentStatus.Pending ||
          app.status === AppointmentStatus.Confirmed ||
          new Date(app.start) >= now,
      );
    } else {
      return allAppointments.filter(
        (app) =>
          app.status === AppointmentStatus.Completed ||
          app.status === AppointmentStatus.Cancelled ||
          new Date(app.end) < now,
      );
    }
  });

  ngOnInit(): void {
    this.store.loadMyAppointments();
  }

  setTab(tab: AppointmentTab): void {
    this.activeTab.set(tab);
  }

  getStatusDetails(status: AppointmentStatus): { text: string; classes: string } {
    switch (status) {
      case AppointmentStatus.Pending:
        return {
          text: 'قيد الانتظار',
          classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'مؤكد',
          classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        };
      case AppointmentStatus.Completed:
        return { text: 'مكتمل', classes: 'bg-bosla-blue/10 text-bosla-blue border-bosla-blue/20' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغي', classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default:
        return { text: 'غير معروف', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }
}
