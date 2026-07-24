import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { JOIN_WINDOW_MS } from '@core/constants/appointment.constants';
import { UiButton } from '@shared/ui/button/button';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { VideoSessionService } from '@features/video/services/video-session.service';
import { ToastService } from '@core/services/toast.service';

import { PaymentStatus, AppointmentDto } from '../../contracts/appointments.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
export type AppointmentTab = 'all' | 'pending' | 'awaiting_payment' | 'paid' | 'completed' | 'cancelled';
export type SortOrder = 'asc' | 'desc';

interface TabDef {
  key: AppointmentTab;
  label: string;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, TranslatePipe],
  templateUrl: './appointments-list.html',
})
export class AppointmentList implements OnDestroy {
  readonly store = inject(AppointmentsStore);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly toast = inject(ToastService);
  private readonly translationService = inject(TranslationService);
  readonly now = signal(Date.now());
  private readonly timerHandle = setInterval(() => this.now.set(Date.now()), 1000);

  async joinSession(appointmentId: string): Promise<void> {
    const apt = this.store.items().find(a => a.id === appointmentId);
    if (!apt || !this.canJoinAppointmentNow(apt)) {
      this.toast.warning(this.translationService.translate('appointments.list.cannotJoin'));
      return;
    }
    try {
      const res = await firstValueFrom(this.videoSessionService.generateToken(appointmentId));
      if (res.data?.sessionId) {
        this.router.navigate(['/video', res.data.sessionId]);
      }
    } catch (err) {
      console.error('Failed to join session', err);
    }
  }

  canJoinAppointment(apt: AppointmentDto): boolean {
    if (apt.status === AppointmentStatus.Cancelled) return false;
    if (apt.status === AppointmentStatus.Completed) return false;
    if (apt.paymentStatus !== PaymentStatus.Paid && apt.status !== AppointmentStatus.Paid) return false;
    return true;
  }

  canJoinAppointmentNow(apt: AppointmentDto): boolean {
    if (!this.canJoinAppointment(apt)) return false;
    const startMs = new Date(apt.start).getTime() - JOIN_WINDOW_MS;
    return this.now() >= startMs;
  }

  getCountdownText(confirmedAt: string, nowMs: number): string | null {
    const deadline = new Date(confirmedAt).getTime() + 21_600_000;
    const remaining = deadline - nowMs;
    if (remaining <= 0) return null;
    const totalSec = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerHandle);
  }

  readonly activeTab = signal<AppointmentTab>('all');
  readonly searchQuery = signal('');
  readonly sortOrder = signal<SortOrder>('asc');

  readonly tabs: TabDef[] = [
    { key: 'all', label: 'appointments.tab.all' },
    { key: 'pending', label: 'appointments.tab.pending' },
    { key: 'awaiting_payment', label: 'appointments.tab.awaitingPayment' },
    { key: 'paid', label: 'appointments.tab.paid' },
    { key: 'completed', label: 'appointments.tab.completed' },
    { key: 'cancelled', label: 'appointments.tab.cancelled' },
  ];

  readonly pendingPaymentCount = computed(() =>
    this.store.items().filter(
      (app) => app.status === AppointmentStatus.Confirmed && app.paymentStatus !== PaymentStatus.Paid,
    ).length,
  );

  readonly tabCounts = computed(() => {
    const all = this.store.items();
    return {
      all: all.length,
      pending: all.filter(a => a.status === AppointmentStatus.Pending).length,
      awaiting_payment: all.filter(a => a.status === AppointmentStatus.Confirmed && a.paymentStatus !== PaymentStatus.Paid).length,
      paid: all.filter(a => a.status === AppointmentStatus.Paid).length,
      completed: all.filter(a => a.status === AppointmentStatus.Completed).length,
      cancelled: all.filter(a => a.status === AppointmentStatus.Cancelled).length,
    };
  });

  getFilteredAppointments(): AppointmentDto[] {
    const all = this.store.items();
    const query = this.searchQuery().trim();
    const tab = this.activeTab();

    let filtered = all;

    if (tab === 'pending') {
      filtered = all.filter(a => a.status === AppointmentStatus.Pending);
    } else if (tab === 'awaiting_payment') {
      filtered = all.filter(a => a.status === AppointmentStatus.Confirmed && a.paymentStatus !== PaymentStatus.Paid);
    } else if (tab === 'paid') {
      filtered = all.filter(a => a.status === AppointmentStatus.Paid);
    } else if (tab === 'completed') {
      filtered = all.filter(a => a.status === AppointmentStatus.Completed);
    } else if (tab === 'cancelled') {
      filtered = all.filter(a => a.status === AppointmentStatus.Cancelled);
    }

    if (query) {
      filtered = filtered.filter(a => {
        const topic = (a.sessionTopic || '');
        const name = (a.specialistName || '');
        return topic.includes(query) || name.includes(query) || a.id.toLowerCase().includes(query);
      });
    }

    const order = this.sortOrder();
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.start).getTime() - new Date(b.start).getTime();
      return order === 'asc' ? diff : -diff;
    });
  }

  readonly userRole = computed(() => this.authService.userRole());
  readonly AppointmentStatus = AppointmentStatus;
  readonly PaymentStatus = PaymentStatus;

  constructor() {
    this.store.loadMyAppointments();
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setTab(tab: AppointmentTab): void {
    this.activeTab.set(tab);
  }

  setSort(order: string): void {
    if (order === 'asc' || order === 'desc') {
      this.sortOrder.set(order);
    }
  }

  readonly dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  getDayName(dateStr: string): string {
    return this.dayNames[new Date(dateStr).getDay()] || '';
  }

  getStatusMeta(status: AppointmentStatus): { text: string; dot: string; bg: string; label: string } {
    switch (status) {
      case AppointmentStatus.Pending:
        return {
          text: 'appointments.status.pending',
          dot: 'bg-amber-400',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'appointments.status.pending',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'appointments.status.awaitingPayment',
          dot: 'bg-emerald-400',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'appointments.status.awaitingPayment',
        };
      case AppointmentStatus.Paid:
        return {
          text: 'appointments.status.paid',
          dot: 'bg-blue-500',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'appointments.status.paid',
        };
      case AppointmentStatus.Completed:
        return {
          text: 'appointments.status.completed',
          dot: 'bg-indigo-400',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'appointments.status.completed',
        };
      case AppointmentStatus.Cancelled:
        return {
          text: 'appointments.status.cancelled',
          dot: 'bg-rose-400',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'appointments.status.cancelled',
        };
      default:
        return {
          text: 'appointments.status.unknown',
          dot: 'bg-gray-400',
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          label: 'appointments.status.unknown',
        };
    }
  }
}
