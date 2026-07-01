import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsStore } from '../../store/appointments.store';
import { CreateAppointmentRequest } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { ToastService } from '@core/services/toast.service';
import { PaymentService } from '@features/payments/services/payment.service';
import { StripePaymentForm } from '@features/payments/components/stripe-payment-form/stripe-payment-form';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiButton, UiSpinner, StripePaymentForm],
  templateUrl: './book-appointment.html'
})
export class BookAppointment implements OnInit, OnDestroy {
  public store = inject(AppointmentsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly paymentService = inject(PaymentService);

  readonly specialistId = signal('');
  readonly sessionTopic = signal('');
  readonly notes = signal('');
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedDate = signal<string | null>(null);

  specialistNotFound = signal(false);
  showStripe = signal(false);
  initiatingPayment = signal(false);
  stripeClientSecret = signal<string | undefined>(undefined);

  readonly selectedSlotInfo = computed(() => {
    const slotId = this.selectedSlotId();
    if (!slotId) return null;
    for (const group of this.store.formattedAvailabilitySlots()) {
      const slot = group.slots.find(s => s.id === slotId);
      if (slot) return { ...slot, displayDate: group.displayDate };
    }
    return null;
  });

  ngOnInit(): void {
    this.store.resetBooking();
    const idFromQuery = this.route.snapshot.queryParamMap.get('specialistId');
    if (idFromQuery) {
      this.specialistId.set(idFromQuery);
      this.store.loadSpecialistInfo(idFromQuery);
      this.store.loadAvailability(idFromQuery);
    } else {
      this.specialistNotFound.set(true);
    }
  }

  ngOnDestroy(): void {
    this.store.resetBooking();
  }

  selectSlot(slotId: string, dateStr: string): void {
    this.selectedSlotId.set(slotId);
    this.selectedDate.set(dateStr);
  }

  onSubmit(): void {
    const slot = this.selectedSlotInfo();
    if (!slot || !this.specialistId()) return;

    const request: CreateAppointmentRequest = {
      specialistId: this.specialistId(),
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      sessionTopic: this.sessionTopic().trim() || undefined,
      notes: this.notes().trim() || undefined
    };

    this.store.createAppointment(request);
  }

  processPayment(): void {
    const id = this.store.bookingAppointmentId();
    if (!id) return;
    this.initiatingPayment.set(true);
    this.paymentService.initiate(id).subscribe({
      next: (res) => {
        this.initiatingPayment.set(false);
        if (res.data?.clientSecret) {
          this.stripeClientSecret.set(res.data.clientSecret);
          this.showStripe.set(true);
        } else {
          this.store.confirmAppointment(id);
        }
      },
      error: () => {
        this.initiatingPayment.set(false);
        this.toast.danger('فشل في بدء عملية الدفع. يرجى المحاولة لاحقاً.');
      }
    });
  }

  onPaymentSuccess(paymentIntentId: string) {
    const id = this.store.bookingAppointmentId();
    if (id) {
      this.store.confirmPayment(id, paymentIntentId);
    }
  }

  onPaymentError(error: string) {
    this.showStripe.set(false);
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }
}
