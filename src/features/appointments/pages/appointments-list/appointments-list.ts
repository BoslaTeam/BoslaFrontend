import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AuthService } from '@core/services/auth.service';
import { AppointmentService } from '../../services/appointments.service';
import { Subscription } from 'rxjs';

import { PaymentStatus } from '../../contracts/appointments.contracts';

export type AppointmentTab = 'upcoming' | 'past' | 'pending_payment';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner],
  templateUrl: './appointments-list.html',
})
export class AppointmentList implements OnInit, OnDestroy {
  readonly store = inject(AppointmentsStore);
  readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly activeTab = signal<AppointmentTab>('upcoming');
  private sub?: Subscription;

  readonly displayLimit = signal(6);

  readonly filteredAppointments = computed(() => {
    const allAppointments = this.store.items();
    const now = new Date();

    if (this.activeTab() === 'pending_payment') {
      return allAppointments.filter(
        (app) =>
          (app.status === AppointmentStatus.Confirmed || app.status === AppointmentStatus.Pending) &&
          app.paymentStatus !== PaymentStatus.Paid &&
          app.paymentStatus !== PaymentStatus.Refunded,
      );
    } else if (this.activeTab() === 'upcoming') {
      return allAppointments.filter(
        (app) =>
          app.status === AppointmentStatus.Pending ||
          app.status === AppointmentStatus.Confirmed ||
          app.status === AppointmentStatus.Rescheduled ||
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

  readonly displayedAppointments = computed(() =>
    this.filteredAppointments().slice(0, this.displayLimit()),
  );

  readonly hasMore = computed(() =>
    this.filteredAppointments().length > this.displayLimit(),
  );

  showMore(): void {
    this.displayLimit.update((l) => l + 6);
    this.cdr.detectChanges();
  }

  readonly pendingPaymentCount = computed(() => {
    return this.store.items().filter(
      (app) =>
        (app.status === AppointmentStatus.Confirmed || app.status === AppointmentStatus.Pending) &&
        app.paymentStatus !== PaymentStatus.Paid &&
        app.paymentStatus !== PaymentStatus.Refunded,
    ).length;
  });

  readonly userRole = computed(() => this.authService.userRole());
  readonly AppointmentStatus = AppointmentStatus;
  readonly PaymentStatus = PaymentStatus;

  ngOnInit(): void {
    this.store.loadMyAppointments();

    this.sub = this.appointmentService.getMyAppointments().subscribe({
      next: () => {
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 50);
      },
    });
  }

  setTab(tab: AppointmentTab): void {
    this.activeTab.set(tab);
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getStatusDetails(status: AppointmentStatus): { text: string; classes: string } {
    switch (status) {
      case AppointmentStatus.Pending:
        return {
          text: 'قيد الانتظار',
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'مؤكد',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
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
