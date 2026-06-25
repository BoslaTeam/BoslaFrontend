import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { SpecialistListItemDto, GetSpecialistsRequest } from '../contracts/specialist.contracts';

@Injectable({
  providedIn: 'root'
})
export class SpecialistService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/specialists`;

  getSpecialists(request: GetSpecialistsRequest): Observable<PaginatedResponse<SpecialistListItemDto>> {
    let params = new HttpParams();
    
    if (request.pageNumber) params = params.set('pageNumber', request.pageNumber);
    if (request.pageSize) params = params.set('pageSize', request.pageSize);
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);

    return this.http.get<ApiResponse<PaginatedResponse<SpecialistListItemDto>>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }
}
