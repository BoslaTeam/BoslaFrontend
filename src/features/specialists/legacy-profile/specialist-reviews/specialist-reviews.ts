import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { SpecialistReviewsResponse } from '../../contracts/specialist-reviews-response';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-specialist-reviews',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './specialist-reviews.html',
})
export class SpecialistReviews implements OnInit {
  private readonly specialistApi = inject(SpecialistApiService);
  readonly reviews = signal<SpecialistReviewsResponse | null>(null);

  ngOnInit() {
    this.specialistApi.getMyReviews().subscribe({
      next: (res) => this.reviews.set(res.data),
    });
  }
}
