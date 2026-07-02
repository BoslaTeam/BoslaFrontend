import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { ToastService } from '@core/services/toast.service';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';

// ─── Types ────────────────────────────────────────────────────────
type SlotStatus = 'available' | 'booked' | 'ended' | 'cancelled';

interface SlotDisplay {
  id: string;
  start: Date;
  end: Date;
  status: SlotStatus;
  clientName: string;
  clientId: string;
  appointmentStatus: number | null;
  source: 'schedule' | 'manual';
  scheduleId?: string;
}

interface BookedApptInfo {
  appointmentId: string;
  userId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: number;
}

export interface ScheduleDefinition {
  id: string;
  days: number[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  startDate: string;
  endDate: string | null;
  enabled: boolean;
  createdAt: string;
}

interface ScheduleSlotMap {
  [scheduleId: string]: string[];
}

// ─── Constants ─────────────────────────────────────────────────────
const MIN_SESSION_MINUTES = 15;
const MAX_GENERATION_DAYS = 15;

const WEEKDAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const STATUS_META: Record<SlotStatus, { label: string }> = {
  available: { label: 'متاح' },
  booked: { label: 'محجوز' },
  ended: { label: 'منتهي' },
  cancelled: { label: 'ملغي' },
};

// ─── Pure Helpers ──────────────────────────────────────────────────
function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateLong(d: Date): string {
  return `${WEEKDAY_NAMES[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}s ${m}d` : `${h}s`;
  }
  return `${totalMin}d`;
}

function slotsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function timeOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const v = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      opts.push({ value: v, label: v });
    }
  }
  return opts;
}

function generateId(): string {
  return `sch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function dayNameEn(n: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][n];
}

function formatTimeShort(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Schedule → Slots engine ──────────────────────────────────────
export function generateSlotsFromSchedule(
  schedule: ScheduleDefinition,
  existingSlots: { start: Date; end: Date }[],
): { start: Date; end: Date; existingSlotId?: string }[] {
  const result: { start: Date; end: Date; existingSlotId?: string }[] = [];
  const now = new Date();

  const startDate = new Date(schedule.startDate + 'T00:00:00');
  const endDate = schedule.endDate
    ? new Date(schedule.endDate + 'T00:00:00')
    : null;

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + MAX_GENERATION_DAYS);
  const effectiveEnd = endDate && endDate < maxDate ? endDate : maxDate;

  const current = new Date(startDate);
  while (current <= effectiveEnd) {
    if (schedule.days.includes(current.getDay())) {
      const [sh, sm] = schedule.startTime.split(':').map(Number);
      const [eh, em] = schedule.endTime.split(':').map(Number);

      const dayStart = new Date(current);
      dayStart.setHours(sh, sm, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(eh, em, 0, 0);

      let slotStart = new Date(dayStart);
      while (slotStart.getTime() + schedule.sessionDuration * 60000 <= dayEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + schedule.sessionDuration * 60000);

        if (slotStart > now) {
          const match = existingSlots.find(
            e => Math.abs(e.start.getTime() - slotStart.getTime()) < 60000
              && Math.abs(e.end.getTime() - slotEnd.getTime()) < 60000,
          );
          result.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
            existingSlotId: match ? (match as any).id : undefined,
          });
        }
        slotStart = slotEnd;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function schedulesConflict(a: ScheduleDefinition, b: ScheduleDefinition): boolean {
  // Date-range overlap
  const aStart = new Date(a.startDate + 'T00:00:00').getTime();
  const aEndMs = a.endDate ? new Date(a.endDate + 'T00:00:00').getTime() : Infinity;
  const bStart = new Date(b.startDate + 'T00:00:00').getTime();
  const bEndMs = b.endDate ? new Date(b.endDate + 'T00:00:00').getTime() : Infinity;
  if (aStart > bEndMs || bStart > aEndMs) return false;

  // Shared weekdays
  const sharedDays = a.days.filter(d => b.days.includes(d));
  if (sharedDays.length === 0) return false;

  // Time overlap
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

function formatSessionDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}س ${m}د` : `${h} ساعات`;
  }
  return `${minutes} دقيقة`;
}

// ─── Component ─────────────────────────────────────────────────────
@Component({
  selector: 'app-specialist-availability',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './specialist-availability.html',
  styleUrl: './specialist-availability.css',
})
export class SpecialistAvailability implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  readonly allTimeOptions = timeOptions();
  readonly durationOptions = DURATION_OPTIONS;
  readonly weekdayNames = WEEKDAY_NAMES;
  readonly STATUS_META = STATUS_META;
  readonly formatTimeShort = formatTimeShort;
  readonly formatSessionDuration = formatSessionDuration;
  readonly formatDateLong = formatDateLong;
  readonly formatDuration = formatDuration;
  readonly formatTime = formatTime;
  readonly dayNameEn = dayNameEn;
  readonly todayStr = new Date().toISOString().slice(0, 10);

  // Schedule form
  readonly editingScheduleId = signal<string | null>(null);
  readonly formDays = signal<boolean[]>(Array(7).fill(false));
  readonly formStartTime = signal('09:00');
  readonly formEndTime = signal('17:00');
  readonly formDuration = signal(60);
  readonly formStartDate = signal('');
  readonly formEndDate = signal('');
  readonly formError = signal('');
  readonly showForm = signal(false);

  readonly availableWeekdays = computed(() => {
    const startStr = this.formStartDate();
    const endStr = this.formEndDate();
    if (!startStr) return Array(7).fill(true);

    const start = new Date(startStr + 'T00:00:00');
    if (isNaN(start.getTime())) return Array(7).fill(true);

    let end: Date;
    if (endStr) {
      end = new Date(endStr + 'T00:00:00');
    } else {
      end = new Date(start);
      end.setDate(end.getDate() + MAX_GENERATION_DAYS);
    }
    if (isNaN(end.getTime()) || end < start) return Array(7).fill(true);

    const available = Array(7).fill(false);
    const cur = new Date(start);
    while (cur <= end) {
      available[cur.getDay()] = true;
      cur.setDate(cur.getDate() + 1);
    }
    return available;
  });

  // Delete confirmation for schedules
  readonly showDeleteConfirm = signal(false);
  readonly scheduleToDelete = signal<ScheduleDefinition | null>(null);

  // Loading
  readonly isSyncing = signal(false);
  readonly isAdding = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Backend data
  readonly rawSlots = signal<{ id: string; start: Date; end: Date }[]>([]);
  readonly appointments = signal<BookedApptInfo[]>([]);
  readonly clientNames = signal<Record<string, string>>({});

  // Local schedules
  readonly schedules = signal<ScheduleDefinition[]>([]);
  readonly scheduleSlotMap = signal<ScheduleSlotMap>({});

  // ─── Computed: Generate slots from active schedules ──────────
  readonly generatedSlots = computed<SlotDisplay[]>(() => {
    const schedules = this.schedules();
    const existing = this.rawSlots();
    const appts = this.appointments();
    const names = this.clientNames();

    const now = new Date();
    const result: SlotDisplay[] = [];

    // Generate slots from active schedules
    for (const sch of schedules) {
      if (!sch.enabled) continue;
      const genSlots = generateSlotsFromSchedule(sch, existing);

      for (const gs of genSlots) {
        const matchingAppt = appts.find(a =>
          slotsOverlap(gs.start, gs.end, new Date(a.startTimeUtc), new Date(a.endTimeUtc)),
        );

        let status: SlotStatus;
        if (gs.end < now) {
          status = 'ended';
        } else if (!matchingAppt) {
          status = 'available';
        } else {
          switch (matchingAppt.status) {
            case AppointmentStatus.Confirmed:
              status = 'booked';
              break;
            case AppointmentStatus.Cancelled:
              status = 'cancelled';
              break;
            default:
              status = 'available';
              break;
          }
        }

        result.push({
          id: gs.existingSlotId || `gen_${sch.id}_${gs.start.getTime()}`,
          start: gs.start,
          end: gs.end,
          status,
          clientName: matchingAppt ? (names[matchingAppt.userId] || '') : '',
          clientId: matchingAppt ? matchingAppt.userId : '',
          appointmentStatus: matchingAppt ? matchingAppt.status : null,
          source: 'schedule',
          scheduleId: sch.id,
        });
      }
    }

    // Add unmatched backend slots (not covered by any schedule)
    for (const raw of existing) {
      const isCovered = result.some(s =>
        Math.abs(s.start.getTime() - raw.start.getTime()) < 60000 &&
        Math.abs(s.end.getTime() - raw.end.getTime()) < 60000
      );
      if (isCovered) continue;

      const matchingAppt = appts.find(a =>
        slotsOverlap(raw.start, raw.end, new Date(a.startTimeUtc), new Date(a.endTimeUtc)),
      );

      let status: SlotStatus;
      if (raw.end < now) {
        status = 'ended';
      } else if (!matchingAppt) {
        status = 'available';
      } else {
        switch (matchingAppt.status) {
          case AppointmentStatus.Confirmed:
            status = 'booked';
            break;
          case AppointmentStatus.Cancelled:
            status = 'cancelled';
            break;
          default:
            status = 'available';
            break;
        }
      }

      result.push({
        id: raw.id,
        start: raw.start,
        end: raw.end,
        status,
        clientName: matchingAppt ? (names[matchingAppt.userId] || '') : '',
        clientId: matchingAppt ? matchingAppt.userId : '',
        appointmentStatus: matchingAppt ? matchingAppt.status : null,
        source: 'manual',
        scheduleId: undefined,
      });
    }

    return result.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  // ─── Stats ───────────────────────────────────────────────────
  readonly stats = computed(() => {
    const all = this.generatedSlots();
    return {
      total: all.length,
      available: all.filter(s => s.status === 'available').length,
      booked: all.filter(s => s.status === 'booked').length,
      ended: all.filter(s => s.status === 'ended' || s.status === 'cancelled').length,
      activeSchedules: this.schedules().filter(s => s.enabled).length,
      totalSchedules: this.schedules().length,
    };
  });

  // ─── Filter + Search ─────────────────────────────────────────
  readonly activeFilter = signal<'all' | 'available' | 'booked' | 'ended'>('all');
  readonly searchQuery = signal('');
  readonly slotScheduleFilter = signal<string | null>(null);

  readonly scheduleFilterOptions = computed(() => {
    const all = this.schedules();
    const current = this.slotScheduleFilter();
    return [{ id: null, label: 'كل الجداول' }, ...all.map(s => ({
      id: s.id,
      label: `${s.days.map(d => WEEKDAY_NAMES[d]).join('، ')} — ${formatTimeShort(s.startTime)}-${formatTimeShort(s.endTime)}`,
    }))];
  });

  readonly filteredSlots = computed(() => {
    let list = this.generatedSlots();
    const f = this.activeFilter();
    const q = this.searchQuery().trim().toLowerCase();
    const schedFilter = this.slotScheduleFilter();

    if (schedFilter) list = list.filter(s => s.scheduleId === schedFilter);
    if (f !== 'all') list = list.filter(s => s.status === f);
    if (q) {
      list = list.filter(s => {
        const dateStr = formatDateLong(s.start).toLowerCase();
        const timeStr = formatTime(s.start) + formatTime(s.end);
        const name = s.clientName.toLowerCase();
        return dateStr.includes(q) || timeStr.includes(q) || name.includes(q);
      });
    }
    return list;
  });

  readonly groupedSlots = computed(() => {
    const groups: { dateLabel: string; date: Date; slots: SlotDisplay[] }[] = [];
    const map = new Map<string, SlotDisplay[]>();

    for (const slot of this.filteredSlots()) {
      const key = `${slot.start.getFullYear()}-${slot.start.getMonth()}-${slot.start.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }

    for (const [key, slots] of map) {
      const [y, m, d] = key.split('-').map(Number);
      const date = new Date(y, m, d);
      groups.push({ dateLabel: formatDateLong(date), date, slots: slots.sort((a, b) => a.start.getTime() - b.start.getTime()) });
    }

    return groups.sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  // ─── Computed: schedule conflicts ─────────────────────────────
  readonly formConflicts = computed(() => {
    const all = this.schedules();
    const editId = this.editingScheduleId();
    const draft: ScheduleDefinition = {
      id: editId || '__draft__',
      days: this.formDays().map((sel, i) => (sel ? i : -1)).filter(i => i >= 0),
      startTime: this.formStartTime(),
      endTime: this.formEndTime(),
      sessionDuration: this.formDuration(),
      startDate: this.formStartDate() || '2000-01-01',
      endDate: this.formEndDate() || null,
      enabled: true,
      createdAt: '',
    };

    if (draft.days.length === 0) return [];

    return all.filter(s => {
      if (s.id === editId) return false;
      return schedulesConflict(draft, s);
    });
  });

  readonly formPreview = computed(() => {
    const days = this.formDays().map((sel, i) => (sel ? i : -1)).filter(i => i >= 0);
    if (days.length === 0 || !this.formStartDate()) return null;
    const [sh, sm] = this.formStartTime().split(':').map(Number);
    const [eh, em] = this.formEndTime().split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) return null;
    const slotsPerDay = Math.floor(totalMinutes / this.formDuration());
    const weeklySlots = days.length * slotsPerDay;
    return { slotsPerDay, weeklySlots };
  });

  // ─── Filter options for template ──────────────────────────────
  readonly filterOptions: { key: 'all' | 'available' | 'booked' | 'ended'; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'available', label: 'المتاحة' },
    { key: 'booked', label: 'المحجوزة' },
    { key: 'ended', label: 'المنتهية' },
  ];

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.initFormDate();
    this.loadData();
  }

  // ─── API Data ─────────────────────────────────────────────────
  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<ApiResponse<{ id: string; start: string; end: string }[]>>(
        API_ENDPOINTS.specialists.availability,
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const items = res.data ?? [];
          this.rawSlots.set(
            (Array.isArray(items) ? items : []).map((i) => ({
              id: i.id,
              start: new Date(i.start),
              end: new Date(i.end),
            })),
          );
          this.loadAppointments();
        },
        error: (err: any) => {
          const title = err?.title || err?.error?.title || err?.message || 'فشل تحميل المواعيد.';
          this.error.set(title);
        },
      });
  }

  private loadAppointments(): void {
    this.http
      .get<any>(`${API_ENDPOINTS.appointments.base}/my-appointments?pageNumber=1&pageSize=100`)
      .subscribe({
        next: (res) => {
          const items = res.data ?? [];
          const list: BookedApptInfo[] = (Array.isArray(items) ? items : []).map((i: any) => ({
            appointmentId: i.id ?? '',
            userId: i.userId ?? '',
            startTimeUtc: i.start ?? '',
            endTimeUtc: i.end ?? '',
            status: typeof i.status === 'number' ? i.status : 0,
          }));
          this.appointments.set(list);
          this.fetchClientNames(list);
        },
        error: () => this.appointments.set([]),
      });
  }

  private fetchClientNames(list: BookedApptInfo[]): void {
    const ids = [...new Set(list.map((a) => a.userId).filter((id) => !!id))];
    if (!ids.length) return;
    ids.forEach((userId) => {
      this.http.get<ApiResponse<any>>(API_ENDPOINTS.users.byId(userId)).subscribe({
        next: (res) => {
          const data = res?.data ?? (res as any);
          this.clientNames.update((m) => ({
            ...m,
            [userId]: data?.fullName || data?.name || data?.displayName || '',
          }));
        },
        error: () => this.clientNames.update((m) => ({ ...m, [userId]: '' })),
      });
    });
  }

  // ─── Form helpers ─────────────────────────────────────────────
  private initFormDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.formStartDate.set(tomorrow.toISOString().slice(0, 10));
  }

  openAddForm(): void {
    this.editingScheduleId.set(null);
    this.formDays.set(Array(7).fill(false));
    this.formStartTime.set('09:00');
    this.formEndTime.set('17:00');
    this.formDuration.set(60);
    this.initFormDate();
    this.formEndDate.set('');
    this.formError.set('');
    this.showForm.set(true);
  }

  openEditForm(schedule: ScheduleDefinition): void {
    this.editingScheduleId.set(schedule.id);
    const days = Array(7).fill(false) as boolean[];
    schedule.days.forEach((d) => (days[d] = true));
    this.formDays.set(days);
    this.formStartTime.set(schedule.startTime);
    this.formEndTime.set(schedule.endTime);
    this.formDuration.set(schedule.sessionDuration);
    this.formStartDate.set(schedule.startDate);
    this.formEndDate.set(schedule.endDate || '');
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingScheduleId.set(null);
    this.formError.set('');
  }

  toggleDay(index: number): void {
    if (!this.availableWeekdays()[index]) return;
    this.formDays.update((d) => {
      const next = [...d];
      next[index] = !next[index];
      return next;
    });
  }

  // ─── Schedule CRUD ────────────────────────────────────────────
  saveSchedule(): void {
    this.formError.set('');

    const selectedDays = this.formDays().map((sel, i) => (sel ? i : -1)).filter((i) => i >= 0);
    if (selectedDays.length === 0) {
      this.formError.set('يرجى اختيار يوم واحد على الأقل.');
      return;
    }

    if (!this.formStartTime() || !this.formEndTime()) {
      this.formError.set('يرجى تحديد وقت البداية والنهاية.');
      return;
    }

    if (this.formStartTime() >= this.formEndTime()) {
      this.formError.set('وقت النهاية يجب أن يكون بعد وقت البداية.');
      return;
    }

    if (!this.formStartDate()) {
      this.formError.set('يرجى تحديد تاريخ البداية.');
      return;
    }

    const startDate = this.formStartDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate + 'T00:00:00') < today) {
      this.formError.set('تاريخ البداية يجب أن يكون اليوم أو بعده.');
      return;
    }

    const endDate = this.formEndDate();
    if (endDate && endDate < startDate) {
      this.formError.set('تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو يساويه.');
      return;
    }

    const editId = this.editingScheduleId();

    // Build draft for conflict check
    const draft: ScheduleDefinition = {
      id: editId || '__draft__',
      days: selectedDays,
      startTime: this.formStartTime(),
      endTime: this.formEndTime(),
      sessionDuration: this.formDuration(),
      startDate: this.formStartDate(),
      endDate: this.formEndDate() || null,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    // Conflict check
    const allSchedules = this.schedules();
    for (const s of allSchedules) {
      if (s.id === editId) continue;
      if (schedulesConflict(draft, s)) {
        this.formError.set('هذا الجدول يتعارض مع جدول موجود مسبقاً.');
        return;
      }
    }

    // If editing, remove old slots first
    if (editId) {
      this.deleteSlotsForSchedule(editId, true);
    }

    // Save schedule
    this.schedules.update((list) => {
      if (editId) {
        return list.map((s) => (s.id === editId ? { ...draft, createdAt: s.createdAt } : s));
      }
      return [...list, draft];
    });

    // Sync slots to backend
    this.syncScheduleSlots(draft);
    this.closeForm();
    this.toast.success(editId ? 'تم تحديث الجدول بنجاح' : 'تم إنشاء الجدول بنجاح');
  }

  private syncScheduleSlots(schedule: ScheduleDefinition): void {
    if (!schedule.enabled) return;

    const existing = this.rawSlots();
    const genSlots = generateSlotsFromSchedule(schedule, existing);
    const slotIds: string[] = [];

    const newSlots = genSlots.filter((gs) => !gs.existingSlotId);

    if (newSlots.length === 0) return;

    this.isSyncing.set(true);

    // Create slots in batches
    const batchSize = 10;
    let completed = 0;

    const createBatch = (batch: { start: Date; end: Date }[]) => {
      const body = {
        availabilities: batch.map((s) => ({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
        })),
      };

      this.http.post(API_ENDPOINTS.specialists.availability, body).subscribe({
        next: (res: any) => {
          const data = res?.data;
          if (Array.isArray(data)) {
            data.forEach((id: string) => slotIds.push(id));
          }

          completed += batch.length;
          if (completed >= newSlots.length) {
            this.scheduleSlotMap.update((m) => ({ ...m, [schedule.id]: slotIds }));
            this.isSyncing.set(false);
            this.loadData();
          } else {
            const nextBatch = newSlots.slice(completed, completed + batchSize);
            if (nextBatch.length) createBatch(nextBatch);
          }
        },
        error: () => {
          this.isSyncing.set(false);
          this.toast.danger('حدث خطأ أثناء مزامنة المواعيد مع الخادم.');
        },
      });
    };

    const firstBatch = newSlots.slice(0, batchSize);
    if (firstBatch.length) createBatch(firstBatch);
  }

  private deleteSlotsForSchedule(scheduleId: string, silent: boolean): void {
    const map = this.scheduleSlotMap();
    const slotIds = map[scheduleId];
    if (!slotIds || slotIds.length === 0) return;

    slotIds.forEach((id) => {
      this.http.delete(API_ENDPOINTS.specialists.availabilityById(id)).subscribe({
        error: () => {
          if (!silent) this.toast.danger(`فشل حذف الموعد ${id}`);
        },
      });
    });

    this.scheduleSlotMap.update((m) => {
      const next = { ...m };
      delete next[scheduleId];
      return next;
    });
  }

  // ─── Schedule management ──────────────────────────────────────
  requestDeleteSchedule(schedule: ScheduleDefinition): void {
    this.scheduleToDelete.set(schedule);
    this.showDeleteConfirm.set(true);
  }

  cancelDeleteSchedule(): void {
    this.showDeleteConfirm.set(false);
    this.scheduleToDelete.set(null);
  }

  confirmDeleteSchedule(): void {
    const schedule = this.scheduleToDelete();
    if (!schedule) return;

    this.deleteSlotsForSchedule(schedule.id, false);
    this.schedules.update((list) => list.filter((s) => s.id !== schedule.id));
    this.showDeleteConfirm.set(false);
    this.scheduleToDelete.set(null);
    this.toast.success('تم حذف الجدول وجميع مواعيده المرتبطة');
    this.loadData();
  }

  toggleSchedule(schedule: ScheduleDefinition): void {
    this.schedules.update((list) =>
      list.map((s) => (s.id === schedule.id ? { ...s, enabled: !s.enabled } : s)),
    );

    const updated = this.schedules().find((s) => s.id === schedule.id);
    if (!updated) return;

    if (updated.enabled) {
      // Re-enable — re-create slots
      this.syncScheduleSlots(updated);
      this.toast.success('تم تفعيل الجدول');
    } else {
      // Disable — delete slots
      this.deleteSlotsForSchedule(schedule.id, false);
      this.toast.success('تم تعطيل الجدول');
      this.loadData();
    }
  }

  // ─── Slot Deletion (manual slots) ─────────────────────────────
  readonly showDeleteSlotConfirm = signal(false);
  readonly slotToDelete = signal<SlotDisplay | null>(null);

  requestDeleteSlot(slot: SlotDisplay): void {
    if (slot.status === 'booked') {
      this.toast.danger('لا يمكن حذف موعد مرتبط بحجز نشط.');
      return;
    }
    if (slot.source !== 'manual') {
      this.toast.danger('هذا الموعد ناتج عن جدول عمل. قم بتعطيل أو حذف الجدول لإزالته.');
      return;
    }
    this.slotToDelete.set(slot);
    this.showDeleteSlotConfirm.set(true);
  }

  cancelDeleteSlot(): void {
    this.showDeleteSlotConfirm.set(false);
    this.slotToDelete.set(null);
  }

  confirmDeleteSlot(): void {
    const slot = this.slotToDelete();
    if (!slot) return;

    this.http
      .delete(API_ENDPOINTS.specialists.availabilityById(slot.id))
      .pipe(finalize(() => {
        this.showDeleteSlotConfirm.set(false);
        this.slotToDelete.set(null);
      }))
      .subscribe({
        next: () => {
          this.toast.success('تم حذف الموعد');
          this.loadData();
        },
        error: (err: any) => {
          const msg = err?.title || err?.error?.title || err?.message || 'فشل حذف الموعد.';
          this.toast.danger(msg);
        },
      });
  }

  // ─── Form duration display ────────────────────────────────────
  computeDurationMs(): number {
    const [sh, sm] = this.formStartTime().split(':').map(Number);
    const [eh, em] = this.formEndTime().split(':').map(Number);
    return (eh * 60 + em - sh * 60 - sm) * 60 * 1000;
  }

  toggleFilter(f: 'all' | 'available' | 'booked' | 'ended'): void {
    this.activeFilter.set(f);
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }
}