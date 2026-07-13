import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppointmentService } from '../../../appointments/services/appointments.service';
import { AppointmentDto } from '../../../appointments/contracts/appointments.contracts';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { AgoraTokenResponse } from '../../../video/models/video-session.model';
import {
  formatArabicDate,
  formatArabicTime,
  formatArabicDuration,
  formatArabicCountdown,
  localizeAppointmentStatus,
} from '@shared/utils/format.util';

interface UpcomingSessionData {
  topic: string;
  notes: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: AppointmentStatus;
  monthAbbr: string;
  dayNum: string;
  isToday: boolean;
  isTomorrow: boolean;
}

@Component({
  selector: 'chat-upcoming-session-card',
  standalone: true,
  imports: [],
  templateUrl: './upcoming-session-card.html',
})
export class UpcomingSessionCard implements OnDestroy {
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private pollSubscription?: ReturnType<typeof setInterval>;
  private timerSubscription?: ReturnType<typeof setInterval>;

  readonly appointmentId = input.required<string>();
  readonly now = signal(Date.now());

  readonly appointment = signal<AppointmentDto | null | undefined>(undefined);
  readonly error = signal<string | null>(null);

  readonly loading = computed(() => this.appointment() === undefined);

  private fetchAppointment(id: string): void {
    this.error.set(null);
    this.appointmentService
      .getById(id)
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Failed to load appointment');
          this.appointment.set(null);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res?.success && res.data) {
          this.appointment.set(res.data);
        } else {
          this.appointment.set(null);
        }
      });
  }

  readonly AppointmentStatus = AppointmentStatus;

  readonly sessionData = computed<UpcomingSessionData | null>(() => {
    const apt = this.appointment();
    if (!apt) return null;

    const start = new Date(apt.start);
    const end = new Date(apt.end);

    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    return {
      topic: apt.sessionTopic ?? '',
      notes: apt.notes ?? '',
      dateLabel: formatArabicDate(start),
      startTime: formatArabicTime(start),
      endTime: formatArabicTime(end),
      durationMin: Math.round((end.getTime() - start.getTime()) / 60000),
      status: apt.status as AppointmentStatus,
      monthAbbr: new Intl.DateTimeFormat('ar-SA', { month: 'short' }).format(start),
      dayNum: new Intl.DateTimeFormat('ar-SA', { day: 'numeric' }).format(start),
      isToday: startDate.getTime() === todayDate.getTime(),
      isTomorrow: startDate.getTime() === tomorrowDate.getTime(),
    };
  });

  readonly localizedStatus = computed(() => {
    const s = this.sessionData()?.status;
    return s !== undefined ? localizeAppointmentStatus(s) : '';
  });

  readonly durationLabel = computed(() => {
    const d = this.sessionData()?.durationMin;
    return d !== undefined ? formatArabicDuration(d) : '';
  });

  readonly remainingLabel = computed(() => {
    const apt = this.appointment();
    if (!apt) return '';
    return formatArabicCountdown(new Date(apt.start), this.now());
  });

  readonly isPastOrCancelled = computed(() => {
    const apt = this.appointment();
    if (!apt) return true;

    if (
      apt.status === AppointmentStatus.Completed ||
      apt.status === AppointmentStatus.Cancelled
    ) {
      return true;
    }

    const end = new Date(apt.end).getTime();
    if (end < this.now()) {
      return true;
    }

    return false;
  });

  readonly isActiveSession = computed(() => {
    const apt = this.appointment();
    if (!apt) return false;

    const n = this.now();
    const start = new Date(apt.start).getTime();
    const end = new Date(apt.end).getTime();

    return n >= start && n < end;
  });

  readonly canJoin = computed(() => {
    if (this.isPastOrCancelled()) return false;
    if (this.isActiveSession()) return true;
    const s = this.sessionData()?.status;
    if (s !== AppointmentStatus.Paid && s !== AppointmentStatus.Confirmed) return false;
    const apt = this.appointment();
    if (!apt) return false;
    const startMs = new Date(apt.start).getTime() - 15 * 60 * 1000;
    return this.now() >= startMs;
  });

  readonly shouldDisplay = computed(() => {
    if (this.loading()) return true;
    const apt = this.appointment();
    if (!apt) return false;
    return !this.isPastOrCancelled();
  });

  readonly sectionTitle = computed(() => {
    if (this.isActiveSession()) return 'الجلسة الحالية';
    return 'الجلسة القادمة';
  });

  retry(): void {
    const id = this.appointmentId();
    if (id) this.fetchAppointment(id);
  }

  joinSession(): void {
    const id = this.appointmentId();
    if (!id) return;
    this.http.post<ApiResponse<AgoraTokenResponse>>(API_ENDPOINTS.video.generateToken, { appointmentId: id }).subscribe({
      next: (res) => {
        const sessionId = res.data?.sessionId;
        if (sessionId) {
          this.router.navigate(['/video', sessionId]);
        }
      },
    });
  }

  constructor() {
    this.timerSubscription = setInterval(() => this.now.set(Date.now()), 1000);

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
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }
  }
}
