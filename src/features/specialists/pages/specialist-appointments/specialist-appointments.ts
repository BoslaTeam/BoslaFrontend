import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { ToastService } from '@core/services/toast.service';

export enum ApptStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
  Rejected = 4,
}

interface SpecialistAppointment {
  id: string;
  clientId: string;
  clientDisplay: string;
  clientInitials: string;
  serviceName: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: ApptStatus;
  amount: number;
}

function toStatus(raw: unknown): ApptStatus {
  if (typeof raw === 'number') return raw as ApptStatus;
  const map: Record<string, ApptStatus> = {
    Pending: ApptStatus.Pending, Confirmed: ApptStatus.Confirmed,
    Completed: ApptStatus.Completed, Cancelled: ApptStatus.Cancelled,
    Rejected: ApptStatus.Rejected,
  };
  return map[String(raw)] ?? ApptStatus.Pending;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase() || '--';
}

function appointmentNumber(id: string): string {
  const hex = id.replace(/-/g, '').slice(-8);
  const num = parseInt(hex, 16) % 10000;
  return `APT-${num.toString().padStart(4, '0')}`;
}

function clientNumber(userId: string): string {
  const hex = userId.replace(/-/g, '').slice(-6);
  const num = parseInt(hex, 16) % 1000;
  return `CLT-${num.toString().padStart(3, '0')}`;
}

const STATUS_LABELS: Record<ApptStatus, string> = {
  [ApptStatus.Pending]: 'قيد الانتظار',
  [ApptStatus.Confirmed]: 'مؤكد',
  [ApptStatus.Completed]: 'مكتمل',
  [ApptStatus.Cancelled]: 'ملغي',
  [ApptStatus.Rejected]: 'مرفوض',
};

const STATUS_CLASSES: Record<ApptStatus, string> = {
  [ApptStatus.Pending]: 'bg-amber-50 text-amber-700 border-amber-200',
  [ApptStatus.Confirmed]: 'bg-blue-50 text-blue-700 border-blue-200',
  [ApptStatus.Completed]: 'bg-green-50 text-green-700 border-green-200',
  [ApptStatus.Cancelled]: 'bg-red-50 text-red-700 border-red-200',
  [ApptStatus.Rejected]: 'bg-slate-50 text-slate-600 border-slate-200',
};

const STATUS_DOTS: Record<ApptStatus, string> = {
  [ApptStatus.Pending]: 'bg-amber-500',
  [ApptStatus.Confirmed]: 'bg-blue-500',
  [ApptStatus.Completed]: 'bg-green-500',
  [ApptStatus.Cancelled]: 'bg-red-500',
  [ApptStatus.Rejected]: 'bg-slate-400',
};

@Component({
  selector: 'app-specialist-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './specialist-appointments.html',
  styleUrl: './specialist-appointments.css',
})
export class SpecialistAppointments implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // Core state
  readonly activeTab = signal<ApptStatus | 'all'>('all');
  readonly searchTerm = signal('');
  readonly appointments = signal<SpecialistAppointment[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalEarnings = signal<number>(0);
  readonly earningsError = signal<string | null>(null);

  // UX state
  readonly countdowns = signal<Record<string, string>>({});
  readonly activeSessions = signal<Record<string, boolean>>({});
  readonly inProgressSessions = signal<Record<string, { joinedAt: number }>>({});
  readonly meetingTimers = signal<Record<string, string>>({});
  readonly expandedId = signal<string | null>(null);
  readonly showCancelled = signal(false);
  readonly clientNames = signal<Record<string, string>>({});
  readonly clientInfo = signal<Record<string, { email?: string; phone?: string }>>({});

  readonly ApptStatus = ApptStatus;
  readonly appointmentNumber = appointmentNumber;
  readonly clientNumber = clientNumber;

  private countdownTimers: Record<string, ReturnType<typeof setInterval>> = {};
  private meetingTimerRefs: Record<string, ReturnType<typeof setInterval>> = {};

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    Object.values(this.countdownTimers).forEach(clearInterval);
    Object.values(this.meetingTimerRefs).forEach(clearInterval);
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.loadEarnings();

    this.http.get<any>(`${API_ENDPOINTS.appointments.base}/my-appointments?pageNumber=1&pageSize=50`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const items = res.data ?? [];
          const list = (Array.isArray(items) ? items : []).map(i => this.toAppointment(i));
          this.appointments.set(list);
          this.fetchClientNames(list);
          this.startCountdowns();
        },
        error: (err: HttpErrorResponse | any) => {
          const msg = err?.title || err?.message || 'فشل تحميل المواعيد. يرجى المحاولة لاحقاً.';
          this.error.set(msg);
        },
      });
  }

  private loadEarnings(): void {
    this.http.get<any>(API_ENDPOINTS.payments.earnings).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        this.totalEarnings.set(data?.totalEarnings ?? 0);
        this.earningsError.set(null);
      },
      error: () => {
        this.totalEarnings.set(0);
        this.earningsError.set('تعذر تحميل بيانات الإيرادات');
      },
    });
  }

  private fetchClientNames(list: SpecialistAppointment[]): void {
    // TODO: Backend should include clientName in GET /appointments/my-appointments response.
    // Until then, fetch user details for each unique clientId.
    const uniqueIds = [...new Set(list.map(a => a.clientId).filter(id => id && id !== 'غير محدد'))];
    if (!uniqueIds.length) return;

    const existing = this.clientNames();
    const toFetch = uniqueIds.filter(id => !existing[id]);

    if (!toFetch.length) {
      this.updateClientDisplay(list, existing);
      return;
    }

    toFetch.forEach((userId: string) => {
      this.http.get<ApiResponse<any>>(API_ENDPOINTS.users.byId(userId)).subscribe({
        next: (res) => {
          const data = res?.data ?? res as any;
          this.clientNames.update(m => ({
            ...m,
            [userId]: data?.fullName || data?.name || data?.displayName || '',
          }));
          this.clientInfo.update(m => ({
            ...m,
            [userId]: {
              email: data?.email || '',
              phone: data?.phoneNumber || data?.phone || '',
            },
          }));
          this.updateClientDisplay(this.appointments(), this.clientNames());
        },
        error: () => {
          this.clientNames.update(m => ({ ...m, [userId]: '' }));
        },
      });
    });
  }

  private updateClientDisplay(list: SpecialistAppointment[], names: Record<string, string>): void {
    let changed = false;
    const updated = list.map(a => {
      if (names[a.clientId] && a.clientDisplay === a.clientId) {
        changed = true;
        return { ...a, clientDisplay: names[a.clientId], clientInitials: initialsOf(names[a.clientId]) };
      }
      return a;
    });
    if (changed) this.appointments.set(updated);
  }

  private startCountdowns(): void {
    Object.values(this.countdownTimers).forEach(clearInterval);
    this.countdownTimers = {};
    const now = Date.now();
    this.appointments().forEach(a => {
      if (a.status !== ApptStatus.Confirmed) return;
      const startMs = new Date(a.startTimeUtc).getTime();
      const endMs = new Date(a.endTimeUtc).getTime();
      if (now > endMs) return;
      this.startCountdown(a.id, startMs, endMs);
    });
  }

  private startCountdown(id: string, startMs: number, endMs: number): void {
    const tick = () => {
      const now = Date.now();
      if (now >= startMs && now <= endMs) {
        this.activeSessions.update(m => ({ ...m, [id]: true }));
        this.countdowns.update(m => ({ ...m, [id]: 'session_active' }));
        return;
      }
      if (now > endMs) {
        this.activeSessions.update(m => ({ ...m, [id]: false }));
        this.countdowns.update(m => ({ ...m, [id]: 'ended' }));
        this.stopCountdown(id);
        return;
      }
      this.activeSessions.update(m => ({ ...m, [id]: false }));
      this.countdowns.update(m => ({ ...m, [id]: this.formatRemaining(startMs - now) }));
    };
    tick();
    this.countdownTimers[id] = setInterval(tick, 1000);
  }

  private stopCountdown(id: string): void {
    if (this.countdownTimers[id]) {
      clearInterval(this.countdownTimers[id]);
      delete this.countdownTimers[id];
    }
  }

  private formatRemaining(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  canJoin(id: string): boolean {
    const apt = this.appointments().find(a => a.id === id);
    if (!apt || apt.status !== ApptStatus.Confirmed) return false;
    if (this.inProgressSessions()[id]) return false;
    const now = Date.now();
    const startMs = new Date(apt.startTimeUtc).getTime() - 10 * 60 * 1000;
    const endMs = new Date(apt.endTimeUtc).getTime();
    return now >= startMs && now <= endMs;
  }

  joinSession(id: string): void {
    if (this.inProgressSessions()[id]) return;
    const joinedAt = Date.now();
    this.inProgressSessions.update(m => ({ ...m, [id]: { joinedAt } }));
    this.stopCountdown(id);
    this.startMeetingTimer(id, joinedAt);
    this.toast.info('تم بدء الجلسة');
  }

  private startMeetingTimer(id: string, joinedAt: number): void {
    const tick = () => {
      const elapsed = Date.now() - joinedAt;
      this.meetingTimers.update(m => ({ ...m, [id]: this.formatDuration(elapsed) }));
    };
    tick();
    this.meetingTimerRefs[id] = setInterval(tick, 1000);
  }

  private formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  endSession(id: string): void {
    this.http.put<ApiResponse<any>>(API_ENDPOINTS.appointments.complete(id), {}).subscribe({
      next: () => {
        this.toast.success('تم إنهاء الجلسة');
        this.cleanupInProgress(id);
        this.loadAppointments();
      },
      error: () => {
        this.toast.danger('فشل إنهاء الجلسة');
      },
    });
  }

  private cleanupInProgress(id: string): void {
    this.inProgressSessions.update(m => {
      const { [id]: _, ...rest } = m;
      return rest;
    });
    this.meetingTimers.update(m => {
      const { [id]: _, ...rest } = m;
      return rest;
    });
    if (this.meetingTimerRefs[id]) {
      clearInterval(this.meetingTimerRefs[id]);
      delete this.meetingTimerRefs[id];
    }
  }

  private toAppointment(item: any): SpecialistAppointment {
    // TODO: Backend should include clientName and amount in GET /appointments/my-appointments response.
    return {
      id: item.id ?? '',
      clientId: item.userId ?? '',
      clientDisplay: item.clientName ?? item.userId ?? 'غير محدد',
      clientInitials: initialsOf(item.clientName ?? item.userId ?? '--'),
      serviceName: item.sessionTopic ?? 'استشارة',
      startTimeUtc: item.start ?? '',
      endTimeUtc: item.end ?? '',
      status: toStatus(item.status),
      amount: 0,
      // TODO: Replace 0 with actual amount when backend provides it
    };
  }

  confirmAppointment(id: string): void {
    this.http.put<ApiResponse<any>>(API_ENDPOINTS.appointments.confirm(id), {}).subscribe({
      next: () => {
        this.toast.success('تم تأكيد الموعد');
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل تأكيد الموعد'),
    });
  }

  rejectAppointment(id: string): void {
    this.http.put<ApiResponse<any>>(`${API_ENDPOINTS.appointments.base}/${id}/reject`, {}).subscribe({
      next: () => {
        this.toast.success('تم رفض الموعد');
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل رفض الموعد'),
    });
  }

  cancelAppointment(id: string): void {
    this.http.put<ApiResponse<any>>(API_ENDPOINTS.appointments.cancel(id), {}).subscribe({
      next: () => {
        this.toast.success('تم إلغاء الموعد');
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل إلغاء الموعد'),
    });
  }

  toggleDetails(id: string): void {
    this.expandedId.update(exp => exp === id ? null : id);
  }

  toggleCancelledVisibility(): void {
    this.showCancelled.update(v => !v);
  }

  getCountdown(id: string): string {
    return this.countdowns()[id] ?? '';
  }

  isSessionActive(id: string): boolean {
    return this.activeSessions()[id] ?? false;
  }

  isInProgress(id: string): boolean {
    return !!this.inProgressSessions()[id];
  }

  getMeetingTimer(id: string): string {
    return this.meetingTimers()[id] ?? '';
  }

  isWithinSessionWindow(id: string): boolean {
    const apt = this.appointments().find(a => a.id === id);
    if (!apt) return false;
    const now = Date.now();
    const startMs = new Date(apt.startTimeUtc).getTime() - 10 * 60 * 1000;
    const endMs = new Date(apt.endTimeUtc).getTime();
    return now >= startMs && now <= endMs;
  }

  readonly filteredAppointments = computed(() => {
    const tab = this.activeTab();
    const term = this.searchTerm().trim().toLowerCase();
    let list = this.appointments();
    if (tab === 'all' && !this.showCancelled()) {
      list = list.filter(a => a.status !== ApptStatus.Cancelled && a.status !== ApptStatus.Rejected);
    }
    if (tab !== 'all') list = list.filter(a => a.status === tab);
    if (term) list = list.filter(a => a.clientDisplay.includes(term) || a.serviceName.includes(term));
    return list;
  });

  readonly stats = computed(() => {
    const all = this.appointments();
    const completed = all.filter(a => a.status === ApptStatus.Completed);
    const count = completed.length;
    const revenue = this.totalEarnings();
    return {
      total: all.length,
      confirmed: all.filter(a => a.status === ApptStatus.Confirmed).length,
      completed: count,
      pending: all.filter(a => a.status === ApptStatus.Pending).length,
      cancelled: all.filter(a => a.status === ApptStatus.Cancelled || a.status === ApptStatus.Rejected).length,
      totalRevenue: revenue,
      avgRevenue: count > 0 ? revenue / count : 0,
      hasEarningsData: revenue > 0 || !this.earningsError(),
    };
  });

  setTab(tab: string): void {
    if (tab === 'all') { this.activeTab.set('all'); return; }
    this.activeTab.set(Number(tab) as ApptStatus);
  }

  setStatusTab(status: ApptStatus): void {
    this.activeTab.set(status);
  }

  statusLabel(s: ApptStatus): string { return STATUS_LABELS[s] ?? 'غير معروف'; }
  statusClass(s: ApptStatus): string { return STATUS_CLASSES[s] ?? 'bg-slate-50 text-slate-600 border-slate-200'; }
  statusDot(s: ApptStatus): string { return STATUS_DOTS[s] ?? 'bg-slate-400'; }
}
