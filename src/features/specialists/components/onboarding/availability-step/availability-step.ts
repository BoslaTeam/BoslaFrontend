import { Component, inject, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { AvailabilityRequest } from '../../../contracts/specialist-availability.contract';
import { ScheduleDraft } from '../../../models/specialist-onboarding-draft.model';

interface ScheduleDefinition {
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

const WEEKDAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const MAX_GENERATION_DAYS = 15;

function generateId(): string {
  return `sch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function timeOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const v = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h >= 12 ? 'م' : 'ص';
      const hour12 = h % 12 || 12;
      opts.push({ value: v, label: `${hour12}:${String(m).padStart(2, '0')} ${period}` });
    }
  }
  return opts;
}

function formatTimeShort(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateLong(d: Date): string {
  return `${WEEKDAY_NAMES[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatSessionDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}س ${m}د` : `${h} ساعات`;
  }
  return `${minutes} دقيقة`;
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

function schedulesConflict(a: ScheduleDefinition, b: ScheduleDefinition): boolean {
  const aStart = new Date(a.startDate + 'T00:00:00').getTime();
  const aEndMs = a.endDate ? new Date(a.endDate + 'T00:00:00').getTime() : Infinity;
  const bStart = new Date(b.startDate + 'T00:00:00').getTime();
  const bEndMs = b.endDate ? new Date(b.endDate + 'T00:00:00').getTime() : Infinity;
  if (aStart > bEndMs || bStart > aEndMs) return false;

  const sharedDays = a.days.filter(d => b.days.includes(d));
  if (sharedDays.length === 0) return false;

  return a.startTime < b.endTime && a.endTime > b.startTime;
}

function generateSlotsFromSchedule(schedule: ScheduleDefinition): { start: Date; end: Date }[] {
  const result: { start: Date; end: Date }[] = [];
  const now = new Date();

  const startDate = new Date(schedule.startDate + 'T00:00:00');
  const endDate = schedule.endDate ? new Date(schedule.endDate + 'T00:00:00') : null;

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
          result.push({ start: new Date(slotStart), end: new Date(slotEnd) });
        }
        slotStart = slotEnd;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

@Component({
  selector: 'availability-step',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './availability-step.html',
})
export class AvailabilityStep {
  readonly onboardingStore = inject(SpecialistOnboardingStore);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly allTimeOptions = timeOptions();
  readonly weekdayNames = WEEKDAY_NAMES;
  readonly durationOptions = DURATION_OPTIONS;
  readonly formatTimeShort = formatTimeShort;
  readonly formatTime = formatTime;
  readonly formatSessionDuration = formatSessionDuration;
  readonly formatDateLong = formatDateLong;
  readonly formatDuration = formatDuration;
  readonly todayStr = new Date().toISOString().slice(0, 10);

  readonly editingScheduleId = signal<string | null>(null);
  readonly formDays = signal<boolean[]>(Array(7).fill(false));
  readonly formStartTime = signal('09:00');
  readonly formEndTime = signal('17:00');
  readonly formDuration = signal(60);
  readonly formStartDate = signal('');
  readonly formEndDate = signal('');
  readonly formError = signal('');
  readonly showForm = signal(false);

  readonly schedules = signal<ScheduleDefinition[]>([]);

  readonly showDeleteConfirm = signal(false);
  readonly scheduleToDelete = signal<ScheduleDefinition | null>(null);

  constructor() {
    this.initFormDate();
    this.loadExisting();
  }

  private initFormDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.formStartDate.set(tomorrow.toISOString().slice(0, 10));
  }

  private loadExisting() {
    const stored = this.onboardingStore.draft().schedules;
    if (stored.length > 0) {
      this.schedules.set(stored.map(s => ({
        ...s,
        id: generateId(),
        createdAt: new Date().toISOString(),
      })));
    }
  }

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

  readonly generatedSlots = computed(() => {
    const result: { start: Date; end: Date }[] = [];
    for (const sch of this.schedules()) {
      if (!sch.enabled) continue;
      const genSlots = generateSlotsFromSchedule(sch);
      for (const gs of genSlots) {
        const hasOverlap = result.some(e => slotsOverlap(gs.start, gs.end, e.start, e.end));
        if (!hasOverlap) {
          result.push(gs);
        }
      }
    }
    return result.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  readonly stats = computed(() => {
    const all = this.generatedSlots();
    return {
      total: all.length,
      activeSchedules: this.schedules().filter(s => s.enabled).length,
      totalSchedules: this.schedules().length,
    };
  });

  readonly groupedSlots = computed(() => {
    const groups = new Map<string, { start: Date; end: Date }[]>();
    for (const slot of this.generatedSlots()) {
      const key = `${slot.start.getFullYear()}-${slot.start.getMonth()}-${slot.start.getDate()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(slot);
    }
    return Array.from(groups.entries())
      .map(([key, slots]) => {
        const [y, m, d] = key.split('-').map(Number);
        return {
          dateLabel: formatDateLong(new Date(y, m, d)),
          date: new Date(y, m, d),
          slots: slots.sort((a, b) => a.start.getTime() - b.start.getTime()),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  toggleDay(index: number) {
    if (!this.availableWeekdays()[index]) return;
    this.formDays.update(d => {
      const next = [...d];
      next[index] = !next[index];
      return next;
    });
  }

  openAddForm() {
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

  openEditForm(schedule: ScheduleDefinition) {
    this.editingScheduleId.set(schedule.id);
    const days = Array(7).fill(false) as boolean[];
    schedule.days.forEach(d => days[d] = true);
    this.formDays.set(days);
    this.formStartTime.set(schedule.startTime);
    this.formEndTime.set(schedule.endTime);
    this.formDuration.set(schedule.sessionDuration);
    this.formStartDate.set(schedule.startDate);
    this.formEndDate.set(schedule.endDate || '');
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingScheduleId.set(null);
    this.formError.set('');
  }

  saveSchedule() {
    this.formError.set('');

    const selectedDays = this.formDays().map((sel, i) => (sel ? i : -1)).filter(i => i >= 0);
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

    const draft: ScheduleDefinition = {
      id: editId || generateId(),
      days: selectedDays,
      startTime: this.formStartTime(),
      endTime: this.formEndTime(),
      sessionDuration: this.formDuration(),
      startDate: this.formStartDate(),
      endDate: this.formEndDate() || null,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    for (const s of this.schedules()) {
      if (s.id === editId) continue;
      if (schedulesConflict(draft, s)) {
        this.formError.set('هذا الجدول يتعارض مع جدول موجود مسبقاً.');
        return;
      }
    }

    this.schedules.update(list => {
      if (editId) {
        return list.map(s => s.id === editId ? { ...draft, createdAt: s.createdAt } : s);
      }
      return [...list, draft];
    });

    this.persistSchedules();
    this.closeForm();
  }

  requestDeleteSchedule(schedule: ScheduleDefinition) {
    this.scheduleToDelete.set(schedule);
    this.showDeleteConfirm.set(true);
  }

  cancelDeleteSchedule() {
    this.showDeleteConfirm.set(false);
    this.scheduleToDelete.set(null);
  }

  confirmDeleteSchedule() {
    const schedule = this.scheduleToDelete();
    if (!schedule) return;
    this.schedules.update(list => list.filter(s => s.id !== schedule.id));
    this.persistSchedules();
    this.showDeleteConfirm.set(false);
    this.scheduleToDelete.set(null);
  }

  toggleSchedule(schedule: ScheduleDefinition) {
    this.schedules.update(list =>
      list.map(s => s.id === schedule.id ? { ...s, enabled: !s.enabled } : s),
    );
    this.persistSchedules();
  }

  private persistSchedules() {
    this.onboardingStore.updateSchedules(
      this.schedules().map(({ id, createdAt, ...rest }) => rest)
    );
  }

  onSubmit() {
    this.persistSchedules();

    const allSlots = this.generatedSlots();
    if (allSlots.length === 0) {
      this.errorMessage.set('يرجى إنشاء جدول عمل واحد على الأقل.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const availabilities: AvailabilityRequest[] = allSlots.map(s => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    }));

    this.onboardingStore.updateAvailabilities(availabilities);
    this.onboardingStore.saveAvailabilities().subscribe({
      next: () => {
        this.isSaving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        const apiError = err.error ?? err;
        const details: string[] = [];
        if (apiError?.errors) {
          for (const key of Object.keys(apiError.errors)) {
            details.push(...apiError.errors[key]);
          }
        }
        this.errorMessage.set(
          details.length > 0
            ? details.join(' | ')
            : (apiError?.title ?? 'فشل في حفظ المواعيد. يرجى المحاولة مرة أخرى.')
        );
      },
    });
  }
}
