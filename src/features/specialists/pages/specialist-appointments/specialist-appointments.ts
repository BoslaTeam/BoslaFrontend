import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { AppointmentsStore } from '@features/appointments/store/appointments.store';
import { AppointmentService } from '@features/appointments/services/appointments.service';
import { ApiResponse } from '@core/models/api-response.model';
import { ToastService } from '@core/services/toast.service';

export enum ApptStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
  Rejected = 4,
  Paid = 5,
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
  isPaid: boolean;
}

function toStatus(raw: unknown): ApptStatus {
  if (typeof raw === 'number') return raw as ApptStatus;
  const map: Record<string, ApptStatus> = {
    Pending: ApptStatus.Pending, Confirmed: ApptStatus.Confirmed,
    Completed: ApptStatus.Completed, Cancelled: ApptStatus.Cancelled,
    Rejected: ApptStatus.Rejected, Paid: ApptStatus.Paid,
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
  [ApptStatus.Paid]: 'مدفوع',
};

const STATUS_CLASSES: Record<ApptStatus, string> = {
  [ApptStatus.Pending]: 'bg-amber-50 text-amber-700 border-amber-200',
  [ApptStatus.Confirmed]: 'bg-blue-50 text-blue-700 border-blue-200',
  [ApptStatus.Completed]: 'bg-green-50 text-green-700 border-green-200',
  [ApptStatus.Cancelled]: 'bg-red-50 text-red-700 border-red-200',
  [ApptStatus.Rejected]: 'bg-slate-50 text-slate-600 border-slate-200',
  [ApptStatus.Paid]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_DOTS: Record<ApptStatus, string> = {
  [ApptStatus.Pending]: 'bg-amber-500',
  [ApptStatus.Confirmed]: 'bg-blue-500',
  [ApptStatus.Completed]: 'bg-green-500',
  [ApptStatus.Cancelled]: 'bg-red-500',
  [ApptStatus.Rejected]: 'bg-slate-400',
  [ApptStatus.Paid]: 'bg-emerald-500',
};

@Component({
  selector: 'app-specialist-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './specialist-appointments.html',
})
export class SpecialistAppointments implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private appointmentService = inject(AppointmentService);
  readonly store = inject(AppointmentsStore);
  private router = inject(Router);

  // Core state
  readonly activeTab = signal<ApptStatus | 'all'>('all');
  readonly searchTerm = signal('');
  readonly appointments = signal<SpecialistAppointment[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly hasMore = signal(false);
  readonly pageNumber = signal(1);
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

  readonly pageSize = 8;

  loadAppointments(page: number = 1, append: boolean = false): void {
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
      this.pageNumber.set(1);
    }
    this.error.set(null);
    this.loadEarnings();

    this.http.get<any>(`${API_ENDPOINTS.appointments.base}/my-appointments?pageNumber=${page}&pageSize=${this.pageSize}`)
      .pipe(finalize(() => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      }))

      .subscribe({
        next: (res) => {
          const items = res.data ?? [];
          const list = (Array.isArray(items) ? items : []).map(i => this.toAppointment(i));
          if (append) {
            this.appointments.update(existing => [...existing, ...list]);
          } else {
            this.appointments.set(list);
          }
          this.pageNumber.set(page);
          const pagination = res.pagination;
          this.hasMore.set(pagination?.hasNextPage ?? false);
          this.fetchClientNames(list);
          this.startCountdowns();
        },
        error: (err: HttpErrorResponse | any) => {
          const msg = err?.title || err?.message || 'فشل تحميل المواعيد. يرجى المحاولة لاحقاً.';
          this.error.set(msg);
        },
      });
  }

  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;
    this.loadAppointments(this.pageNumber() + 1, true);
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
      this.updateClientDisplay(this.appointments(), existing);
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
    this.appointments().forEach(a => {
      if (a.status !== ApptStatus.Confirmed && a.status !== ApptStatus.Paid) return;
      const startMs = new Date(a.startTimeUtc).getTime();
      const endMs = new Date(a.endTimeUtc).getTime();
      this.startCountdown(a.id, startMs, endMs);
    });
  }

  private startCountdown(id: string, startMs: number, endMs: number): void {
    const tick = () => {
      const now = Date.now();
      if (now < startMs) {
        this.activeSessions.update(m => ({ ...m, [id]: false }));
        this.countdowns.update(m => ({ ...m, [id]: 'countdown_' + this.formatRemaining(startMs - now) }));
      } else if (now >= startMs && now <= endMs) {
        this.activeSessions.update(m => ({ ...m, [id]: true }));
        this.countdowns.update(m => ({ ...m, [id]: 'late_' + this.formatDuration(now - startMs) }));
      } else {
        this.activeSessions.update(m => ({ ...m, [id]: false }));
        this.countdowns.update(m => ({ ...m, [id]: 'missed_' + this.formatDuration(now - endMs) }));
      }
    };
    tick();
    this.countdownTimers[id] = setInterval(tick, 1000);
  }

  getCountdownType(id: string): string {
    const val = this.countdowns()[id] ?? '';
    if (val.startsWith('countdown_')) return 'countdown';
    if (val.startsWith('late_')) return 'late';
    if (val.startsWith('missed_')) return 'missed';
    return '';
  }

  getCountdownValue(id: string): string {
    const val = this.countdowns()[id] ?? '';
    if (val.startsWith('countdown_')) return val.slice('countdown_'.length);
    if (val.startsWith('late_')) return val.slice('late_'.length);
    if (val.startsWith('missed_')) return val.slice('missed_'.length);
    return val;
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
    if (!apt) return false;
    if (apt.status !== ApptStatus.Paid) return false;
    if (this.inProgressSessions()[id]) return false;
    const now = Date.now();
    const startMs = new Date(apt.startTimeUtc).getTime() - 10 * 60 * 1000;
    return now >= startMs;
  }

  joinSession(id: string): void {
    if (this.inProgressSessions()[id]) return;
    this.toast.info('جاري تجهيز الجلسة...');
    this.http.post<ApiResponse<{ sessionId: string }>>(API_ENDPOINTS.video.generateToken, { appointmentId: id }).subscribe({
      next: (res) => {
        const sessionId = res.data?.sessionId;
        if (sessionId) {
          this.router.navigate(['/specialist/video', sessionId]);
        } else {
          this.toast.danger('فشل الحصول على معرف الجلسة');
        }
      },
      error: () => {
        this.toast.danger('فشل تجهيز الجلسة');
      },
    });
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
    const userId = item.userId ?? '';
    return {
      id: item.id ?? '',
      clientId: userId,
      clientDisplay: userId,
      clientInitials: initialsOf(userId),
      serviceName: item.sessionTopic ?? '',
      startTimeUtc: item.start ?? '',
      endTimeUtc: item.end ?? '',
      status: toStatus(item.status),
      amount: item.sessionPrice ?? item.amount ?? 0,
      isPaid: item.isPaid ?? false,
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

  reason = signal('');

  showRejectModal = signal(false);
  showCancelModal = signal(false);
  showDeleteModal = signal(false);
  pendingActionId = signal<string | null>(null);

  openRejectPrompt(id: string): void {
    this.reason.set('');
    this.pendingActionId.set(id);
    this.showRejectModal.set(true);
  }

  openCancelPrompt(id: string): void {
    this.reason.set('');
    this.pendingActionId.set(id);
    this.showCancelModal.set(true);
  }

  confirmReject(): void {
    const id = this.pendingActionId();
    if (!id) return;
    this.http.put<ApiResponse<any>>(`${API_ENDPOINTS.appointments.base}/${id}/reject`, { reason: this.reason() || undefined }).subscribe({
      next: () => {
        this.toast.success('تم رفض الموعد');
        this.showRejectModal.set(false);
        this.pendingActionId.set(null);
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل رفض الموعد'),
    });
  }

  confirmCancel(): void {
    const id = this.pendingActionId();
    if (!id) return;
    this.http.put<ApiResponse<any>>(API_ENDPOINTS.appointments.cancel(id), { reason: this.reason() || undefined }).subscribe({
      next: () => {
        this.toast.success('تم إلغاء الموعد');
        this.showCancelModal.set(false);
        this.pendingActionId.set(null);
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل إلغاء الموعد'),
    });
  }

  openDeletePrompt(id: string): void {
    this.pendingActionId.set(id);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingActionId();
    if (!id) return;
    this.http.delete<ApiResponse<any>>(API_ENDPOINTS.appointments.byId(id)).subscribe({
      next: () => {
        this.toast.success('تم حذف الموعد');
        this.showDeleteModal.set(false);
        this.pendingActionId.set(null);
        this.loadAppointments();
      },
      error: () => this.toast.danger('فشل حذف الموعد'),
    });
  }

  toggleDetails(id: string): void {
    this.expandedId.update(exp => exp === id ? null : id);
  }

  toggleCancelledVisibility(): void {
    this.showCancelled.update(v => !v);
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
      paid: all.filter(a => a.status === ApptStatus.Paid).length,
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
