import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppointmentsStore } from '../../store/appointments.store';
import { CreateAppointmentRequest } from '../../contracts/appointments.contracts';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { UiButton } from '@shared/ui/button/button';

interface SpecialistBrief {
  id: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  hourlyRate?: number;
  rating?: number;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiButton],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.css',
})
export class BookAppointment implements OnInit {
  public store = inject(AppointmentsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly specialist = signal<SpecialistBrief | null>(null);
  readonly specialistLoading = signal(false);

  readonly sessionTopic = signal('');
  readonly appointmentDate = signal('');
  readonly startTime = signal('');
  readonly endTime = signal('');
  readonly notes = signal('');

  ngOnInit(): void {
    const idFromQuery = this.route.snapshot.queryParamMap.get('specialistId');
    if (idFromQuery) {
      this.loadSpecialist(idFromQuery);
    }
  }

  private loadSpecialist(id: string): void {
    this.specialistLoading.set(true);
    this.http.get<any>(API_ENDPOINTS.specialists.byId(id)).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        this.specialist.set({
          id,
          name: data?.fullName || data?.name || data?.displayName,
          title: data?.title,
          imageUrl: data?.profileImageUrl || data?.imageUrl,
          hourlyRate: data?.hourlyRate,
          rating: data?.rating,
        });
        this.specialistLoading.set(false);
      },
      error: () => {
        this.specialist.set({ id });
        this.specialistLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (!this.appointmentDate() || !this.startTime() || !this.endTime()) {
      return;
    }

    const specialistId = this.specialist()?.id;
    if (!specialistId) return;

    const startDateTime = new Date(`${this.appointmentDate()}T${this.startTime()}`).toISOString();
    const endDateTime = new Date(`${this.appointmentDate()}T${this.endTime()}`).toISOString();

    const request: CreateAppointmentRequest = {
      specialistId,
      start: startDateTime,
      end: endDateTime,
      sessionTopic: this.sessionTopic().trim() || undefined,
      notes: this.notes().trim() || undefined,
    };

    this.store.createAppointment(request, () => {
      this.router.navigate(['/appointments']);
    });
  }
}
