import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { SpecialistsFilters } from '../contracts/specialist-filters.contract';
import { SpecialistsApiService } from './specialist-api.service';
import { SpecialistsMapper } from './specialists-mapper';

@Injectable({
  providedIn: 'root',
})
export class SpecialistListRepository {
  private readonly api = inject(SpecialistsApiService);

  getExpertise() {
    return this.api.getExpertise().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getSkills() {
    return this.api.getSkills().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getTools() {
    return this.api.getTools().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getIndustries() {
    return this.api.getIndustries().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getSpecialists(filters: SpecialistsFilters) {
    return this.api.getSpecialists(filters).pipe(
      map(response => ({
        items: response.data.items.map(SpecialistsMapper.mapSpecialist),
        metadata: response.data.metadata,
      })),
    );
  }
}
