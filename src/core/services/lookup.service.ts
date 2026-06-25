import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { LookupItemDto } from '../contracts/lookup.contracts';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lookup`;

  getExpertise(): Observable<LookupItemDto[]> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(`${this.baseUrl}/expertise`)
      .pipe(map(res => res.data));
  }

  getIndustries(): Observable<LookupItemDto[]> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(`${this.baseUrl}/industries`)
      .pipe(map(res => res.data));
  }

  getSkills(): Observable<LookupItemDto[]> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(`${this.baseUrl}/skills`)
      .pipe(map(res => res.data));
  }

  getTools(): Observable<LookupItemDto[]> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(`${this.baseUrl}/tools`)
      .pipe(map(res => res.data));
  }
}
