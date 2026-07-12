import { DecimalPipe } from '@angular/common';
import { Component, input, computed } from '@angular/core';

export interface RatingDistribution {
  stars: number;     // من 1 إلى 5
  percentage: number; // النسبة المئوية من 0 إلى 100
}

@Component({
  selector: 'ui-rating-summary',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './rating-summary.html',
})
export class UiRatingSummary {
  // المدخلات الأساسية للبطاقة الإجمالية
  readonly averageRating = input<number>(4.8);
  readonly totalReviews = input<number>(124);

  // توزيع النسب لكل نجمة (تأتي مرتبة من 5 نجوم نزولاً إلى 1 نجمة)
  readonly distribution = input.required<RatingDistribution[]>();

  // حساب النجوم الكاملة للمتوسط الرقمي الكبير
  readonly fullStars = computed(() => {
    return Array(Math.floor(this.averageRating())).fill(0);
  });

  readonly emptyStars = computed(() => {
    const total = 5;
    const full = Math.floor(this.averageRating());
    const hasHalf = this.averageRating() - full >= 0.5 ? 1 : 0;
    const empty = Math.max(0, total - full - hasHalf);
    return Array(empty).fill(0);
  });
}