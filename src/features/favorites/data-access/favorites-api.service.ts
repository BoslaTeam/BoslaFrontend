import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { FavoriteSpecialistDto } from '../contracts/favorite.contract';

@Injectable({ providedIn: 'root' })
export class FavoritesApiService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<ApiResponse<FavoriteSpecialistDto[]>>(API_ENDPOINTS.favorites.specialists);
  }

  toggle(specialistId: string) {
    return this.http.post<ApiResponse<boolean>>(API_ENDPOINTS.favorites.toggleSpecialist(specialistId), {});
  }

  status(specialistId: string) {
    return this.http.get<ApiResponse<boolean>>(API_ENDPOINTS.favorites.specialistStatus(specialistId));
  }
}
