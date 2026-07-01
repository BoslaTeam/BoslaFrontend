import { Component, inject, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiButton } from '@shared/ui/button/button';
import { AvailabilityRequest } from '../../../contracts/specialist-availability.contract';

interface SlotPreview {
  start: Date;
  end: Date;
}

const WEEKDAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const MAX_GENERATION_DAYS = 90;

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

function formatTimeShort(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatSessionDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}س ${m}د` : `${h} ساعات`;
  }
  return `${minutes} دقيقة`;
}

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function formatDateLong(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function slotsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function generateSlots(days: number[], startTime: string, endTime: string, duration: number, startDate: string, endDate: string | null): SlotPreview[] {
  const result: SlotPreview[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_GENERATION_DAYS);
  const effectiveEnd = end && end < maxDate ? end : maxDate;

  if (start < today) return result;

  const current = new Date(start);
  while (current <= effectiveEnd) {
    if (days.includes(current.getDay())) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);

      const dayStart = new Date(current);
      dayStart.setHours(sh, sm, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(eh, em, 0, 0);

      let slotStart = new Date(dayStart);
      while (slotStart.getTime() + duration * 60000 <= dayEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        if (slotEnd > today) {
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
  imports: [FormsModule, UiButton],
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

  readonly formDays = signal<boolean[]>(Array(7).fill(false));
  readonly formStartTime = signal('09:00');
  readonly formEndTime = signal('17:00');
  readonly formDuration = signal(60);
  readonly formStartDate = signal('');
  readonly formEndDate = signal('');
  readonly formError = signal('');
  readonly showForm = signal(true);

  readonly generatedSlots = signal<SlotPreview[]>([]);
  readonly showDeleteConfirm = signal(false);
  readonly slotToDelete = signal<SlotPreview | null>(null);

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
    const existing = this.onboardingStore.draft().availabilities;
    if (existing.length > 0) {
      this.showForm.set(false);
      this.generatedSlots.set(
        existing.map(a => ({ start: new Date(a.start), end: new Date(a.end) }))
      );
    }
  }

  toggleDay(index: number) {
    this.formDays.update(d => {
      const next = [...d];
      next[index] = !next[index];
      return next;
    });
  }

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

  readonly groupedSlots = computed(() => {
    const groups = new Map<string, SlotPreview[]>();
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

  readonly totalSlotsCount = computed(() => this.generatedSlots().length);

  generateSchedule() {
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

    const newSlots = generateSlots(
      selectedDays,
      this.formStartTime(),
      this.formEndTime(),
      this.formDuration(),
      this.formStartDate(),
      this.formEndDate() || null,
    );

    if (newSlots.length === 0) {
      this.formError.set('لم يتم إنشاء أي مواعيد. تحقق من التاريخ والوقت.');
      return;
    }

    const existing = this.generatedSlots();
    const allSlots = [...existing];
    for (const ns of newSlots) {
      const hasOverlap = existing.some(e => slotsOverlap(ns.start, ns.end, e.start, e.end));
      if (!hasOverlap) {
        allSlots.push(ns);
      }
    }

    this.generatedSlots.set(allSlots);
    this.showForm.set(false);
  }

  requestDeleteSlot(slot: SlotPreview) {
    this.slotToDelete.set(slot);
    this.showDeleteConfirm.set(true);
  }

  cancelDeleteSlot() {
    this.showDeleteConfirm.set(false);
    this.slotToDelete.set(null);
  }

  confirmDeleteSlot() {
    const slot = this.slotToDelete();
    if (!slot) return;
    this.generatedSlots.update(slots =>
      slots.filter(s => s.start.getTime() !== slot.start.getTime() || s.end.getTime() !== slot.end.getTime())
    );
    this.showDeleteConfirm.set(false);
    this.slotToDelete.set(null);
  }

  addAnotherSchedule() {
    this.formDays.set(Array(7).fill(false));
    this.formStartTime.set('09:00');
    this.formEndTime.set('17:00');
    this.formDuration.set(60);
    this.initFormDate();
    this.formEndDate.set('');
    this.formError.set('');
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.generatedSlots().length === 0) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const availabilities: AvailabilityRequest[] = this.generatedSlots().map(s => ({
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
        const details: string[] = [];
        if (err.error?.errors) {
          for (const key of Object.keys(err.error.errors)) {
            details.push(...err.error.errors[key]);
          }
        }
        this.errorMessage.set(
          details.length > 0
            ? details.join(' | ')
            : (err.error?.title ?? 'فشل في حفظ المواعيد. يرجى المحاولة مرة أخرى.')
        );
      },
    });
  }
}
