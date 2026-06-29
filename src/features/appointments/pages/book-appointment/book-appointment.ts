import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsStore } from '../../store/appointments.store';
import { CreateAppointmentRequest } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
// import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiButton],
  templateUrl: './book-appointment.html'
})
export class BookAppointment {
  public store = inject(AppointmentsStore);
  private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);

  readonly specialistId = signal('');
  readonly sessionTopic = signal('');
  readonly appointmentDate = signal('');
  readonly startTime = signal('');
  readonly endTime = signal('');
  readonly notes = signal('');

ngOnInit(): void {

    const idFromQuery = this.route.snapshot.queryParamMap.get('specialistId');
    if (idFromQuery) {
      this.specialistId.set(idFromQuery);
    }
  }
  onSubmit(): void {
    if (!this.specialistId() || !this.appointmentDate() || !this.startTime() || !this.endTime()) {
      return;
    }

    const startDateTime = new Date(`${this.appointmentDate()}T${this.startTime()}`).toISOString();
    const endDateTime = new Date(`${this.appointmentDate()}T${this.endTime()}`).toISOString();

    const request: CreateAppointmentRequest = {
      specialistId: this.specialistId(),
      start: startDateTime,
      end: endDateTime,
      sessionTopic: this.sessionTopic().trim() || undefined,
      notes: this.notes().trim() || undefined
    };

    this.store.createAppointment(request, () => {
      this.router.navigate(['/appointments']);
    });
  }
}