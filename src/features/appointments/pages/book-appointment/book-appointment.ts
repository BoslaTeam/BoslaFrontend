import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsStore } from '../../store/appointments.store';
import { CreateAppointmentRequest } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiButton, UiSpinner],
  templateUrl: './book-appointment.html'
})
export class BookAppointment implements OnInit {
  public store = inject(AppointmentsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly specialistId = signal('');
  readonly sessionTopic = signal('');
  readonly notes = signal('');
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedDate = signal<string | null>(null);

  specialistNotFound = signal(false);

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

  goToAppointments(): void {
    this.router.navigate(['/appointments']);
  }
}
