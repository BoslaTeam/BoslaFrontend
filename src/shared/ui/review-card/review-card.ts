import { Component, input, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

export interface ReviewItem {
  id: string | number;
  authorName: string;
  avatarUrl?: string;
  timeAgo: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
}

@Component({
  selector: 'ui-review-card',
  standalone: true,
  imports: [],
  templateUrl: './review-card.html',
})
export class UiReviewCard {
  readonly review = input.required<ReviewItem>();

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  readonly stars = computed(() => {
    const count = Math.min(5, Math.max(1, this.review().rating));
    return Array(count).fill(0);
  });

  readonly emptyStars = computed(() => {
    const count = Math.min(5, Math.max(1, this.review().rating));
    const emptyCount = 5 - count;
    return Array(emptyCount).fill(0);
  });
}