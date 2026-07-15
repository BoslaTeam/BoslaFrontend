import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpecialistDetailsStore } from '@features/specialists/store/specialist-details.store';
import { SpecialistsApiService } from '@features/specialists/data-access/specialist-api.service';
import { FavoritesApiService } from '@features/favorites/data-access/favorites-api.service';
import { AuthService } from '@core/services/auth.service';
import { PortfolioItemDto } from '@features/specialists/contracts/specialist-portfolio.contract';
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
    RouterModule
  ],
  templateUrl: './specialist-details.html',
  styleUrl: './specialist-details.css',
})
export class SpecialistDetailsPage implements OnInit {
  readonly store = inject(SpecialistDetailsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private specialistsApi = inject(SpecialistsApiService);
  private favoritesApi = inject(FavoritesApiService);
  readonly authService = inject(AuthService);

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  readonly activeTab = signal<string>('profile');
  readonly portfolioItems = signal<PortfolioItemDto[]>([]);
  readonly portfolioLoading = signal(false);
  readonly specialistName = computed(() => this.store.specialist()?.name || '');
  readonly isFavorited = signal(false);
  readonly favoriteToggling = signal(false);

  readonly tabs: TabItem[] = [
    { id: 'profile', label: 'الملف الشخصي' },
    // { id: 'portfolio', label: 'معرض الأعمال' },
    { id: 'reviews', label: 'التقييمات' },
    { id: 'availability', label: 'الأوقات المتاحة' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.load(id);
      this.loadPortfolio(id);
      this.loadFavoriteStatus(id);
    }
  }

  private loadPortfolio(specialistId: string) {
    this.portfolioLoading.set(true);
    this.specialistsApi.getPublicPortfolio(specialistId).subscribe({
      next: (res) => {
        this.portfolioItems.set(res.data || []);
        this.portfolioLoading.set(false);
      },
      error: () => this.portfolioLoading.set(false),
    });
  }

  private loadFavoriteStatus(specialistId: string) {
    if (!this.authService.isAuthenticated()) return;
    this.favoritesApi.status(specialistId).subscribe({
      next: (res) => this.isFavorited.set(res.data ?? false),
    });
  }

  toggleFavorite(specialistId: string) {
    if (!this.authService.isAuthenticated()) return;
    this.favoriteToggling.set(true);
    this.favoritesApi.toggle(specialistId).subscribe({
      next: (res) => {
        this.isFavorited.set(res.data ?? !this.isFavorited());
        this.favoriteToggling.set(false);
      },
      error: () => this.favoriteToggling.set(false),
    });
  }

  openPortfolioDetail(item: PortfolioItemDto) {
    const specialistId = this.route.snapshot.paramMap.get('id');
    if (specialistId) {
      this.router.navigate(['/specialists', specialistId, 'portfolio', item.id], {
        queryParams: { name: this.specialistName() },
      });
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
