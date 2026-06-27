import { Component, inject, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiButton } from '@shared/ui/button/button';
import { AvailabilityRequest } from '../../../contracts/specialist-availability.contract';

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
  readonly selectedDate = signal<string>('');

  readonly startTime = signal('09:00');
  readonly endTime = signal('10:00');

  readonly timeOptions = signal<{ value: string; label: string }[]>([]);

  readonly endTimeOptions = computed(() =>
    this.timeOptions().filter(t => t.value > this.startTime())
  );

  readonly dateInvalid = computed(() => {
    if (!this.selectedDate()) return false;
    const [y, m, d] = this.selectedDate().split('-').map(Number);
    const selected = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  });

  readonly submitDisabled = computed(() =>
    this.isSaving() || !this.selectedDate() || this.onboardingStore.draft().availabilities.length === 0 || this.dateInvalid()
  );

  readonly groupedByDate = computed(() => {
    const groups = new Map<string, AvailabilityRequest[]>();
    const availabilities = this.onboardingStore.draft().availabilities;
    for (const slot of availabilities) {
      const key = slot.start.slice(0, 10);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(slot);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((a, b) => a.start.localeCompare(b.start)),
      }));
  });

  private readonly dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  private readonly monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  constructor() {
    this.initDefaultDate();
    this.generateTimeOptions();
  }

  private initDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    this.selectedDate.set(`${yyyy}-${mm}-${dd}`);
  }

  private generateTimeOptions() {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push({ value, label: value });
      }
    }
    this.timeOptions.set(options);
  }

  onStartTimeChange(value: string) {
    this.startTime.set(value);
    if (this.endTime() <= value) {
      const next = this.timeOptions().find(t => t.value > value);
      if (next) this.endTime.set(next.value);
    }
  }

  addPeriod() {
    this.errorMessage.set('');

    if (this.dateInvalid()) {
      this.errorMessage.set('لا يمكن اختيار تاريخ في الماضي.');
      return;
    }

    const [startHour, startMin] = this.startTime().split(':').map(Number);
    const [endHour, endMin] = this.endTime().split(':').map(Number);
    const [year, month, day] = this.selectedDate().split('-').map(Number);

    const start = new Date(year, month - 1, day, startHour, startMin, 0, 0);
    const end = new Date(year, month - 1, day, endHour, endMin, 0, 0);

    const dateStr = this.selectedDate();

    for (const slot of this.onboardingStore.draft().availabilities) {
      if (slot.start.slice(0, 10) !== dateStr) continue;
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      if (start < slotEnd && end > slotStart) {
        this.errorMessage.set('هذه الفترة تتداخل مع فترة موجودة مسبقاً.');
        return;
      }
    }

    const newSlot: AvailabilityRequest = {
      start: start.toISOString(),
      end: end.toISOString(),
    };

    this.onboardingStore.updateAvailabilities([
      ...this.onboardingStore.draft().availabilities,
      newSlot,
    ]);
  }

  removePeriod(slot: AvailabilityRequest) {
    this.onboardingStore.updateAvailabilities(
      this.onboardingStore.draft().availabilities.filter(s => s.start !== slot.start || s.end !== slot.end)
    );
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatDate(isoString: string): string {
    const d = new Date(isoString);
    return `${this.dayNames[d.getDay()]}، ${d.getDate()} ${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  onSubmit() {
    if (!this.selectedDate() || this.onboardingStore.draft().availabilities.length === 0) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

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
