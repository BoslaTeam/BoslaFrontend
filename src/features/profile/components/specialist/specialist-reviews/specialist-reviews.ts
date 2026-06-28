import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialistApiService } from '../../../../specialists/data-access/specialist-api.service';
import { SpecialistReviewsResponse } from '../../../../specialists/contracts/specialist-reviews-response';

@Component({
  selector: 'app-specialist-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialist-reviews.html',
})
export class SpecialistReviews implements OnInit {
  private specialistApi = inject(SpecialistApiService);
  private cdr = inject(ChangeDetectorRef);

  reviewsData = signal<SpecialistReviewsResponse | null>(null);

  ngOnInit() {
    this.loadReviews();
  }

  private loadReviews() {
    this.specialistApi.getMyReviews().subscribe(res => {
      this.reviewsData.set(res.data);
      this.cdr.markForCheck();
    });
  }
}
