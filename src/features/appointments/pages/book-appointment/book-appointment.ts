import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsStore } from '../../store/appointments.store';
import { CreateAppointmentRequest } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiButton],
  templateUrl: './book-appointment.html'
})
export class BookAppointment implements OnInit {
  private static readonly STORAGE_KEY = 'bosla_booking_form';

  public store = inject(AppointmentsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly Math = Math;
  readonly specialistId = signal('');
  readonly sessionTopic = signal('');
  readonly notes = signal('');
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedDate = signal<string | null>(null);
  readonly showReview = signal(false);

  specialistNotFound = signal(false);

  constructor() {
    effect(() => {
      sessionStorage.setItem(BookAppointment.STORAGE_KEY, JSON.stringify({
        specialistId: this.specialistId(),
        sessionTopic: this.sessionTopic(),
        notes: this.notes(),
      }));
    });
  }

  readonly selectedSlotInfo = computed(() => {
    const slotId = this.selectedSlotId();
    if (!slotId) return null;
    for (const group of this.store.formattedAvailabilitySlots()) {
      const slot = group.slots.find(s => s.id === slotId);
      if (slot) return { ...slot, displayDate: group.displayDate };
    }
    return null;
  });

  readonly selectedGroup = computed(() => {
    const date = this.selectedDate();
    if (!date) return null;
    return this.store.formattedAvailabilitySlots().find(g => g.dateStr === date) ?? null;
  });

  readonly currentStep = computed(() => {
    if (!this.selectedDate()) return 1;
    if (!this.selectedSlotId()) return 2;
    if (!this.showReview()) return 3;
    return 4;
  });

  readonly durationMinutes = computed(() => {
    const slot = this.selectedSlotInfo();
    if (!slot) return 0;
    return Math.round((slot.end.getTime() - slot.start.getTime()) / 60000);
  });

  readonly totalPrice = computed(() => {
    const rate = this.store.specialistInfo()?.hourlyRate ?? 0;
    const hours = this.durationMinutes() / 60;
    return Math.round(rate * hours);
  });

  ngOnInit(): void {
    this.store.resetBooking();
    const idFromQuery = this.route.snapshot.queryParamMap.get('specialistId');
    if (idFromQuery) {
      this.specialistId.set(idFromQuery);
      this.store.loadSpecialistInfo(idFromQuery);
      this.store.loadAvailability(idFromQuery);

      const saved = sessionStorage.getItem(BookAppointment.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.specialistId === idFromQuery) {
            if (parsed.sessionTopic) this.sessionTopic.set(parsed.sessionTopic);
            if (parsed.notes) this.notes.set(parsed.notes);
          }
        } catch { /* ignore */ }
      }
    } else {
      this.specialistNotFound.set(true);
    }
  }



  selectSlot(slotId: string, dateStr: string): void {
    this.selectedSlotId.set(slotId);
    this.selectedDate.set(dateStr);
    this.showReview.set(false);
  }

  goToReview(): void {
    this.showReview.set(true);
  }

  backToStep3(): void {
    this.showReview.set(false);
  }

  onSubmit(): void {
    const slot = this.selectedSlotInfo();
    if (!slot || !this.specialistId()) return;

    const request: CreateAppointmentRequest = {
      specialistId: this.specialistId(),
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      sessionTopic: this.sessionTopic().trim() || undefined,
      notes: this.notes().trim() || undefined,
      slotId: slot.id
    };

    sessionStorage.removeItem(BookAppointment.STORAGE_KEY);
    this.store.createAppointment(request);
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  resetStep1(): void {
    if (this.store.bookingStep() === 'form') {
      this.selectedDate.set(null);
      this.selectedSlotId.set(null);
    }
  }

  resetStep2(): void {
    if (this.store.bookingStep() === 'form' && this.selectedDate()) {
      this.selectedSlotId.set(null);
    }
  }
}
