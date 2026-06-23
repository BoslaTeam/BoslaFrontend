import { Component, input, output, computed } from '@angular/core';

export type SlotState = 'available' | 'selected' | 'disabled';

@Component({
  selector: 'ui-time-slot',
  standalone: true,
  imports: [],
  templateUrl: './time-slot.html',
})
export class UiTimeSlot {
  readonly time = input.required<string>();
  readonly state = input<SlotState>('available');
  readonly slotClick = output<string>();

  readonly slotClasses = computed(() => {
    const base = 'flex items-center justify-center h-11 border text-[14px] font-sans font-medium transition-all duration-200 select-none rounded-[2px] w-full';
    
    const states = {
      available: 'bg-white border-bosla-charcoal/20 text-bosla-charcoal hover:border-bosla-blue hover:text-bosla-blue cursor-pointer',
      selected: 'bg-bosla-blue border-bosla-blue text-white font-bold shadow-xs cursor-pointer',
      disabled: 'bg-bosla-charcoal/[0.04] border-bosla-charcoal/10 text-bosla-charcoal/30 line-through cursor-not-allowed'
    };

    return `${base} ${states[this.state()]}`;
  });

  onClick() {
    if (this.state() !== 'disabled') {
      this.slotClick.emit(this.time());
    }
  }
}