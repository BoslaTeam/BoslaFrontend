import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpecialistDetailsStore } from '@features/specialists/store/specialist-details.store';
import { UiButton } from '@shared/ui/button/button';
import { UiRatingSummary } from '@shared/ui/rating-summary/rating-summary';
import { UiReviewCard } from '@shared/ui/review-card/review-card';
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
})
export class SpecialistDetailsPage implements OnInit {
  readonly store = inject(SpecialistDetailsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activeTab = signal<string>('profile');

  readonly tabs: TabItem[] = [
    { id: 'profile', label: 'الملف الشخصي' },
    { id: 'reviews', label: 'التقييمات' },
    { id: 'availability', label: 'الأوقات المتاحة' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.load(id);
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
}
