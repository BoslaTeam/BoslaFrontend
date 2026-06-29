import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { SpecialistsApiService } from './specialist-api.service';
import { SpecialistsMapper } from './specialists-mapper';

@Injectable({
  providedIn: 'root',
})
export class SpecialistDetailsRepository {
  private readonly api = inject(SpecialistsApiService);

  getSpecialistById(id: string) {
    return this.api.getSpecialistById(id).pipe(
      map(response =>
        SpecialistsMapper.mapSpecialistDetails(response.data)
      ),
    );
  }

  getReviews(id: string) {
    return this.api.getReviews(id).pipe(
      map(response =>
        response.data.reviews.items.map(SpecialistsMapper.mapReview)
      ),
    );
  }

  getAvailability(id: string) {
    return this.api.getAvailability(id).pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapAvailability)
      ),
    );
  }
}
