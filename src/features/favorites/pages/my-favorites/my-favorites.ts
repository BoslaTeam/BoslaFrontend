import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesApiService } from '../../data-access/favorites-api.service';
import { FavoriteSpecialistDto } from '../../contracts/favorite.contract';
import { UiButton } from '@shared/ui/button/button';
import { UiEmptyState } from '@shared/ui/empty-state/empty-state';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, UiButton, UiEmptyState, TranslatePipe],
  templateUrl: './my-favorites.html',
})
export class MyFavoritesPage {
  private readonly favoritesApi = inject(FavoritesApiService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  readonly favorites = signal<FavoriteSpecialistDto[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.favoritesApi.getAll().subscribe({
      next: (res) => {
        this.favorites.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  remove(specialistId: string) {
    this.favoritesApi.toggle(specialistId).subscribe({
      next: () => this.favorites.update(list => list.filter(f => f.specialistId !== specialistId)),
    });
  }

  experienceLevelLabel(level: number): string {
    const labels = ['', 'مبتدئ', 'متوسط', 'متقدم', 'خبير'];
    return labels[level] || '';
  }
}
