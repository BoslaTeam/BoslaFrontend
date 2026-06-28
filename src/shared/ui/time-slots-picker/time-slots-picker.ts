import { Component, input, model, output, signal, computed } from '@angular/core';
import { SlotState, UiTimeSlot } from '../time-slot/time-slot';

export interface TimeSlotItem {
  time: string;
  isDisabled?: boolean;
}

@Component({
  selector: 'ui-time-slots-picker',
  standalone: true,
  imports: [UiTimeSlot],
  templateUrl: './time-slots-picker.html',
})
export class UiTimeSlotsPicker {
  readonly title = input<string>('متاح اليوم');
  readonly slots = input.required<TimeSlotItem[]>();

  readonly selectedTime = model<string[]>([]);

  readonly prevClick = output<number>();
  readonly nextClick = output<number>();

  private readonly PAGE_SIZE = 6;

  readonly currentPage = signal<number>(0);

  readonly visibleSlots = computed(() => {
    const start = this.currentPage() * this.PAGE_SIZE;
    const end = start + this.PAGE_SIZE;
    return this.slots().slice(start, end);
  });

  readonly canPrev = computed(() => this.currentPage() > 0);

  readonly canNext = computed(() => {
    const totalSlots = this.slots().length;
    return (this.currentPage() + 1) * this.PAGE_SIZE < totalSlots;
  });

  readonly showNavigation = computed(() => this.slots().length > this.PAGE_SIZE);

  nextPage(): void {
    if (this.canNext()) {
      this.currentPage.update(p => p + 1);
      this.nextClick.emit(this.currentPage());
    }
  }

  prevPage(): void {
    if (this.canPrev()) {
      this.currentPage.update(p => p - 1);
      this.prevClick.emit(this.currentPage());
    }
  }

  getSlotState(item: TimeSlotItem): SlotState {
    if (item.isDisabled) return 'disabled';
    return this.selectedTime().includes(item.time) ? 'selected' : 'available';
  }

  onSlotSelect(time: string) {
    this.selectedTime.update(current => {
      if (current.includes(time)) {
        return current.filter(t => t !== time);
      }
      return [...current, time];
    });
  }
}
