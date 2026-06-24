import { Component, input, computed } from '@angular/core';

export type StatCardVariant = 'blue' | 'orange';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.html',
})
export class UiStatCard {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>(); // كلاس Font Awesome
  readonly variant = input<StatCardVariant>('blue');

  // تخصيص الألوان الناعمة للأيقونة بناءً على الواجهة المرفقة
  readonly iconClasses = computed(() => {
    const base = 'w-12 h-12 flex items-center justify-center rounded-[12px] text-lg transition-all';
    const variants = {
      blue: 'bg-[#eaf4fa] text-bosla-blue',
      orange: 'bg-[#fff3e0] text-bosla-orange'
    };
    return `${base} ${variants[this.variant()]}`;
  });
}