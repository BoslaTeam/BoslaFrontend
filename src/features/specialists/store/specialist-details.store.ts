import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SpecialistDetails } from '../models/specialist-details.model';
import { Review } from '../models/review.model';
import { Availability } from '../models/availability.model';

import { SpecialistDetailsRepository } from '../data-access/specialist-details.repository';

import { RatingDistribution } from '@shared/ui/rating-summary/rating-summary';
import { ReviewItem } from '@shared/ui/review-card/review-card';
import { formatTimeAgo } from '@shared/utils/time-ago.util';
import { formatAvailabilityDate, formatAvailabilityTime } from '@shared/utils/date-format.util';

const EXPIERENCE_LEVEL_LABELS: Record<number, string> = {
  0: 'مبتدئ',
  1: 'متوسط',
  2: 'متقدم',
  3: 'خبير',
};

@Injectable({
  providedIn: 'root',
})
export class SpecialistDetailsStore {
  private readonly repository = inject(SpecialistDetailsRepository);

  readonly specialist = signal<SpecialistDetails | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly availability = signal<Availability[]>([]);

  readonly detailsLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly experienceLevelLabel = computed(() => {
    const level = this.specialist()?.experienceLevel;
    return EXPIERENCE_LEVEL_LABELS[level ?? 0] || '';
  });

  readonly ratingDistribution = computed<RatingDistribution[]>(() => {
    const reviews = this.reviews();
    if (reviews.length === 0) {
      return [
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 },
      ];
    }

    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star - 1]++;
    });

    const total = reviews.length;
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: Math.round((counts[stars - 1] / total) * 100),
    }));
  });

  readonly reviewItems = computed<ReviewItem[]>(() => {
    return this.reviews().map(r => ({
      id: r.id,
      authorName: r.reviewerName,
      timeAgo: formatTimeAgo(r.createdAt),
      rating: r.rating,
      comment: r.comment,
    }));
  });

  readonly experiences = computed(() => {
    return this.specialist()?.experiences ?? [];
  });

  readonly canCancel = computed(() => {
    const s = this.specialist();
    if (!s) return false;
    return s.allowCancellation && s.cancellationDeadlineHours > 0;
  });

  readonly availabilitySlots = computed(() => {
    return this.availability().map(a => ({
      id: a.id,
      start: new Date(a.start),
      end: new Date(a.end),
      dateStr: formatAvailabilityDate(new Date(a.start)),
      timeStr: formatAvailabilityTime(new Date(a.start), new Date(a.end)),
    }));
  });

  load(id: string) {
    this.detailsLoading.set(true);
    this.error.set(null);

    forkJoin({
      specialist: this.repository.getSpecialistById(id),
      reviews: this.repository.getReviews(id),
      availability: this.repository.getAvailability(id),
    })
      .pipe(finalize(() => this.detailsLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.specialist.set(data.specialist);
          this.reviews.set(data.reviews);
          this.availability.set(data.availability);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load specialist details');
        },
      });
  }
}
