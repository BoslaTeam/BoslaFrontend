import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { UiButton } from '@shared/ui/button/button';

export type AppointmentTab = 'upcoming' | 'past';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, DatePipe],
  templateUrl: './appointments-list.html',
  styleUrl: './appointments-list.css',
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

  readonly stats = computed(() => {
    const all = this.store.items();
    return {
      total: all.length,
      upcoming: all.filter(a =>
        a.status === AppointmentStatus.Pending ||
        a.status === AppointmentStatus.Confirmed
      ).length,
      completed: all.filter(a => a.status === AppointmentStatus.Completed).length,
      cancelled: all.filter(a => a.status === AppointmentStatus.Cancelled).length,
    };
  });

  ngOnInit(): void {
    this.store.loadMyAppointments();
  }

  setTab(tab: AppointmentTab): void {
    this.activeTab.set(tab);
  }

  getStatusDetails(status: AppointmentStatus): { text: string; classes: string; dot: string } {
    switch (status) {
      case AppointmentStatus.Pending:
        return { text: 'قيد الانتظار', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case AppointmentStatus.Confirmed:
        return { text: 'مؤكد', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case AppointmentStatus.Completed:
        return { text: 'مكتمل', classes: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغي', classes: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      default:
        return { text: 'غير معروف', classes: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
    }
  }
}
