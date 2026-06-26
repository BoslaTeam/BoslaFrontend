import { Component, computed, effect, inject, input, OnDestroy, signal, untracked } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentDto } from '../../models/chat.model';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';

interface UpcomingSessionData {
  topic: string;
  notes: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: AppointmentStatus;
}

@Component({
  selector: 'chat-upcoming-session-card',
  standalone: true,
  imports: [],
  templateUrl: './upcoming-session-card.html',
})
export class UpcomingSessionCard implements OnDestroy {
  private readonly appointmentService = inject(AppointmentService);
  private pollSubscription?: ReturnType<typeof setInterval>;

  readonly appointmentId = input.required<string>();

  readonly appointment = signal<AppointmentDto | null | undefined>(undefined);
  readonly error = signal<string | null>(null);

  readonly loading = computed(() => this.appointment() === undefined);

  private fetchAppointment(id: string): void {
    this.error.set(null);
    this.appointmentService.getById(id)
      .pipe(catchError(err => {
        this.error.set(err?.message ?? 'Failed to load appointment');
        this.appointment.set(null);
        return of(null);
      }))
      .subscribe(res => {
        if (res?.success && res.data) {
          this.appointment.set(res.data);
        } else {
          this.appointment.set(null);
        }
      });
  }

  readonly sessionData = computed<UpcomingSessionData | null>(() => {
    const apt = this.appointment();
    if (!apt) return null;

    const start = new Date(apt.start);
    const end = new Date(apt.end);

    return {
      topic: apt.sessionTopic,
      notes: apt.notes,
      dateLabel: start.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      startTime: start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      endTime: end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      durationMin: Math.round((end.getTime() - start.getTime()) / 60000),
      status: apt.status as AppointmentStatus,
    };
  });

  readonly statusLabel = computed(() => {
    const s = this.sessionData()?.status;
    const map: Record<number, string> = {
      [AppointmentStatus.Pending]: 'Pending',
      [AppointmentStatus.Confirmed]: 'Confirmed',
      [AppointmentStatus.Completed]: 'Completed',
      [AppointmentStatus.Cancelled]: 'Cancelled',
      [AppointmentStatus.Rescheduled]: 'Rescheduled',
    };
    return s !== undefined ? map[s] ?? 'Unknown' : '';
  });

  readonly statusClass = computed(() => {
    const s = this.sessionData()?.status;
    const map: Record<number, string> = {
      [AppointmentStatus.Pending]: 'chat-apt-status-pending',
      [AppointmentStatus.Confirmed]: 'chat-apt-status-confirmed',
      [AppointmentStatus.Completed]: 'chat-apt-status-completed',
      [AppointmentStatus.Cancelled]: 'chat-apt-status-cancelled',
      [AppointmentStatus.Rescheduled]: 'chat-apt-status-rescheduled',
    };
    return s !== undefined ? map[s] ?? '' : '';
  });

  readonly countdown = computed(() => {
    const apt = this.appointment();
    if (!apt) return '';

    const start = new Date(apt.start).getTime();
    const now = new Date().getTime();
    const diffMs = start - now;

    if (diffMs <= 0) {
      return '';
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) {
      return 'Starts in < 1m';
    }

    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const hours = diffHours % 24;
    const days = Math.floor(diffHours / 24);

    if (days > 0) {
      return `Starts in ${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `Starts in ${hours}h ${mins}m`;
    }
    return `Starts in ${mins}m`;
  });

  retry(): void {
    const id = this.appointmentId();
    if (id) this.fetchAppointment(id);
  }

  constructor() {
    effect(() => {
      const id = this.appointmentId();
      if (!id) return;

      untracked(() => {
        this.fetchAppointment(id);
        if (!this.pollSubscription) {
          this.pollSubscription = setInterval(() => {
            const currentId = this.appointmentId();
            if (currentId) this.fetchAppointment(currentId);
          }, 30000);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      clearInterval(this.pollSubscription);
    }
  }
}
