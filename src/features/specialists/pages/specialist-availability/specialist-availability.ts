import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpecialistsApiService } from '../../data-access/specialist-api.service';
import { SpecialistAvailabilityResponse, AvailabilityRequest } from '../../contracts/specialist-availability.contract';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { ToastService } from '@core/services/toast.service';

interface DayOption {
  key: number;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-specialist-availability',
  standalone: true,
  imports: [FormsModule, CommonModule, UiButton, UiSpinner],
  templateUrl: './specialist-availability.html',
})
export class SpecialistAvailability implements OnInit {
  private readonly api = inject(SpecialistsApiService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly slots = signal<SpecialistAvailabilityResponse[]>([]);
  readonly errorMessage = signal('');

  // Manual slot
  readonly manualDate = signal(this.getDefaultDate());
  readonly manualStart = signal('09:00');
  readonly manualEnd = signal('10:00');

  // Weekly pattern
  readonly days: DayOption[] = [
    { key: 0, label: 'الأحد', selected: false },
    { key: 1, label: 'الإثنين', selected: false },
    { key: 2, label: 'الثلاثاء', selected: false },
    { key: 3, label: 'الأربعاء', selected: false },
    { key: 4, label: 'الخميس', selected: false },
    { key: 5, label: 'الجمعة', selected: false },
    { key: 6, label: 'السبت', selected: false },
  ];
  readonly weeklyStart = signal('09:00');
  readonly weeklyEnd = signal('10:00');
  readonly weeklyWeeks = signal(4);

  readonly timeOptions = this.generateTimeOptions();

  readonly groupedSlots = computed(() => {
    const groups = new Map<string, SpecialistAvailabilityResponse[]>();
    for (const slot of this.slots()) {
      const dateKey = slot.start.slice(0, 10);
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(slot);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        displayDate: this.formatDate(date),
        slots: items.sort((a, b) => a.start.localeCompare(b.start)),
      }));
  });

  readonly selectedDayCount = computed(() => this.days.filter(d => d.selected).length);

  ngOnInit(): void {
    this.loadSlots();
  }

  private loadSlots(): void {
    this.isLoading.set(true);
    this.api.getMyAvailability().subscribe({
      next: (res) => {
        this.slots.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.danger('فشل في تحميل المواعيد المتاحة.');
      },
    });
  }

  addManualSlot(): void {
    this.errorMessage.set('');
    const start = new Date(this.manualDate() + 'T' + this.manualStart + ':00');
    const end = new Date(this.manualDate() + 'T' + this.manualEnd + ':00');

    if (start <= new Date()) {
      this.errorMessage.set('لا يمكن إضافة موعد في الماضي.');
      return;
    }
    if (end <= start) {
      this.errorMessage.set('وقت النهاية يجب أن يكون بعد وقت البداية.');
      return;
    }

    const newSlot: AvailabilityRequest = {
      start: start.toISOString(),
      end: end.toISOString(),
    };

    this.isSaving.set(true);
    this.api.addAvailabilities({ availabilities: [newSlot] }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('تمت إضافة الموعد بنجاح.');
        this.loadSlots();
        this.manualDate.set(this.getDefaultDate());
        this.manualStart.set('09:00');
        this.manualEnd.set('10:00');
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err.error?.title || err.message || 'فشل في إضافة الموعد.';
        this.errorMessage.set(msg);
      },
    });
  }

  addWeeklyPattern(): void {
    this.errorMessage.set('');
    const selectedDays = this.days.filter(d => d.selected);
    if (selectedDays.length === 0) {
      this.errorMessage.set('اختر يومًا على الأقل.');
      return;
    }

    const slots: AvailabilityRequest[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeksAhead = this.weeklyWeeks();

    for (let w = 0; w < weeksAhead; w++) {
      for (const day of selectedDays) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + ((day.key - today.getDay() + 7) % 7) + w * 7);
        if (targetDate <= today) continue;

        const [sh, sm] = this.weeklyStart().split(':').map(Number);
        const [eh, em] = this.weeklyEnd().split(':').map(Number);
        const start = new Date(targetDate);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(targetDate);
        end.setHours(eh, em, 0, 0);

        if (end <= start) continue;

        slots.push({
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }
    }

    if (slots.length === 0) {
      this.errorMessage.set('لم يتم إنشاء أي مواعيد. تأكد من اختيار أيام صحيحة.');
      return;
    }

    this.isSaving.set(true);
    this.api.addAvailabilities({ availabilities: slots }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success(`تمت إضافة ${slots.length} موعد بنجاح.`);
        this.loadSlots();
        this.days.forEach(d => (d.selected = false));
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err.error?.title || err.message || 'فشل في إضافة المواعيد.';
        this.errorMessage.set(msg);
      },
    });
  }

  deleteSlot(id: string): void {
    this.api.deleteAvailability(id).subscribe({
      next: () => {
        this.toast.success('تم حذف الموعد بنجاح.');
        this.loadSlots();
      },
      error: () => {
        this.toast.danger('فشل في حذف الموعد.');
      },
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  private getDefaultDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private generateTimeOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push({ value, label: value });
      }
    }
    return options;
  }
}
