import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { PaymentService } from '@features/payments/services/payment.service';
import { StripePaymentForm } from '@features/payments/components/stripe-payment-form/stripe-payment-form';
import { ToastService } from '@core/services/toast.service';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-appointment-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner, StripePaymentForm],
  templateUrl: './appointment-payment.html',
})
export class AppointmentPayment implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AppointmentsStore);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);

  private readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly isInitiating = signal(false);
  readonly showStripe = signal(false);
  readonly stripeClientSecret = signal<string | null>(null);
  readonly paymentDone = signal(false);

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
          this.toast.success('تم إرسال طلب الحجز، يمكنك الدفع لاحقاً من صفحة المواعيد.');
          this.router.navigate(['/appointments', this.appointmentId]);
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

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  goToDetails(): void {
    this.router.navigate(['/appointments', this.appointmentId]);
  }
}
