import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpecialistsStore } from '@features/specialists/store/specialists.store';
import { UiButton } from '@shared/ui/button/button';
import { UiRatingSummary, RatingDistribution } from '@shared/ui/rating-summary/rating-summary';
import { UiReviewCard, ReviewItem } from '@shared/ui/review-card/review-card';
import { UiTabs, TabItem } from '@shared/ui/tabs/tabs';
import { UiEmptyState } from '@shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-specialist-details-page',
  standalone: true,
  imports: [
    CommonModule,
    UiButton,
    UiRatingSummary,
    UiReviewCard,
    UiEmptyState,
    UiTabs,
  ],
  templateUrl: './specialist-details.html',
  styleUrl: './specialist-details.css',
})
export class SpecialistDetailsPage implements OnInit {
  readonly store = inject(SpecialistsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activeTab = signal<string>('profile');

  readonly Math = Math;

  readonly tabs: TabItem[] = [
    { id: 'profile', label: 'الملف الشخصي' },
    { id: 'reviews', label: 'التقييمات' },
    { id: 'availability', label: 'الأوقات المتاحة' },
  ];

  readonly specialistId = signal<string>('');

  readonly ratingDistribution = computed<RatingDistribution[]>(() => {
    const reviews = this.store.reviews();
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
    return this.store.reviews().map(r => ({
      id: r.id,
      authorName: r.userName,
      timeAgo: this.getTimeAgo(r.createdAt),
      rating: r.rating,
      comment: r.comment,
    }));
  });

  readonly availabilitySlots = computed(() => {
    return this.store.availability().map(a => ({
      id: a.id,
      start: new Date(a.start),
      end: new Date(a.end),
      dateStr: this.formatDate(new Date(a.start)),
      timeStr: this.formatTime(new Date(a.start), new Date(a.end)),
    }));
  });

  readonly experienceLevelLabel = computed(() => {
    const level = this.store.specialist()?.experienceLevel;
    const labels: Record<number, string> = {
      1: 'مبتدئ',
      2: 'متوسط',
      3: 'متقدم',
      4: 'خبير',
    };
    return labels[level ?? 0] || '';
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.specialistId.set(id);
      this.store.loadProfile(id);
    }
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  goBack() {
    this.router.navigate(['/specialists']);
  }

  bookNow() {
    // TODO: Navigate to booking flow
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return `منذ ${Math.floor(diffDays / 30)} شهر`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(start: Date, end: Date): string {
    const fmt = new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${fmt.format(start)} - ${fmt.format(end)}`;
  }
}
