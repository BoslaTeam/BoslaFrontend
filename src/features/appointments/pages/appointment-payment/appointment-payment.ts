import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { PaymentService } from '@features/payments/services/payment.service';
import { StripePaymentForm } from '@features/payments/components/stripe-payment-form/stripe-payment-form';
import { ToastService } from '@core/services/toast.service';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { PaymentStatus } from '../../contracts/appointments.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-appointment-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner, StripePaymentForm, TranslatePipe],
  templateUrl: './appointment-payment.html',
})
export class AppointmentPayment implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AppointmentsStore);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  private readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly isInitiating = signal(false);
  readonly showStripe = signal(false);
  readonly stripeClientSecret = signal<string | null>(null);
  readonly paymentDone = signal(false);

  readonly AppointmentStatus = AppointmentStatus;
  readonly PaymentStatus = PaymentStatus;

  readonly paymentDeadline = computed(() => {
    const item = this.store.selectedItem();
    if (!item?.confirmedAt) return null;
    if (item.status !== AppointmentStatus.Confirmed) return null;
    if (item.paymentStatus === PaymentStatus.Paid || item.paymentStatus === PaymentStatus.Refunded) return null;
    return new Date(item.confirmedAt).getTime() + 21_600_000;
  });

  readonly remainingMs = signal(0);
  private paymentTimerHandle: ReturnType<typeof setInterval> | null = null;

  private stopPaymentTimer(): void {
    if (this.paymentTimerHandle) {
      clearInterval(this.paymentTimerHandle);
      this.paymentTimerHandle = null;
    }
  }

  formatCountdown(ms: number): string {
    if (ms <= 0) return '0:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  readonly expired = computed(() => {
    const deadline = this.paymentDeadline();
    return deadline ? deadline <= Date.now() : false;
  });

  constructor() {
    effect(() => {
      const deadline = this.paymentDeadline();
      this.stopPaymentTimer();
      if (deadline) {
        this.remainingMs.set(deadline - Date.now());
        this.paymentTimerHandle = setInterval(() => {
          const remaining = deadline - Date.now();
          if (remaining <= 0) {
            this.remainingMs.set(0);
            this.stopPaymentTimer();
            this.store.loadAppointmentDetails(this.appointmentId);
          } else {
            this.remainingMs.set(remaining);
          }
        }, 1000);
      } else {
        this.remainingMs.set(0);
      }
    });
  }

  ngOnInit(): void {
    if (this.appointmentId) {
      this.store.loadAppointmentDetails(this.appointmentId);
    }
  }

  processPayment(): void {
    if (!this.appointmentId) return;
    this.isInitiating.set(true);
    this.paymentService.initiate(this.appointmentId).subscribe({
      next: (res) => {
        this.isInitiating.set(false);
        if (res.data?.clientSecret) {
          this.stripeClientSecret.set(res.data.clientSecret);
          this.showStripe.set(true);
        } else {
          this.toast.danger('فشل في الحصول على بيانات الدفع. الـ clientSecret فارغ - راجع الباك اند.');
        }
      },
      error: (err) => {
        this.isInitiating.set(false);
        this.toast.danger(err?.error?.message || 'فشل في بدء عملية الدفع. يرجى المحاولة لاحقاً.');
      },
    });
  }

  onPaymentSuccess(paymentIntentId: string): void {
    this.store.confirmPayment(this.appointmentId, paymentIntentId);
    this.paymentDone.set(true);
  }

  onPaymentError(error: string): void {
    this.toast.danger(error);
    this.showStripe.set(false);
    this.stripeClientSecret.set(null);
  }

  ngOnDestroy(): void {
    this.stopPaymentTimer();
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  goToDetails(): void {
    this.router.navigate(['/appointments', this.appointmentId]);
  }
}
