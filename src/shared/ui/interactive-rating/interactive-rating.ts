import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'ui-interactive-rating',
  standalone: true,
  templateUrl: './interactive-rating.html',
})
export class UiInteractiveRating {
  // استقبال قيمة التقييم الابتدائية إن وجدت
  readonly maxStars = input<number>(5);
  readonly ratingChange = output<number>();

  readonly selectedRating = signal<number>(0);
  readonly hoverRating = signal<number | null>(null);

  // تحديث حالة الـ Hover عند تحريك الفأرة
  onMouseEnter(starIndex: number): void {
    this.hoverRating.set(starIndex);
  }

  onMouseLeave(): void {
    this.hoverRating.set(null);
  }

  // تثبيت التقييم عند الضغط
  selectRating(starIndex: number): void {
    this.selectedRating.set(starIndex);
    this.ratingChange.emit(starIndex);
  }
}