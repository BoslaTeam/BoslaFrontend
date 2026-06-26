import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../src/environments/environment';

import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { buildHttpParams } from '@core/utils/http-params.util';

import { LookupResponse } from '../contracts/lookup.contract';
import { SpecialistsFilters } from '../contracts/specialist-filters.contract';
import { SpecialistResponse } from '../contracts/specialist.contract';
import { SpecialistAvailabilityResponse } from '../contracts/specialist-availability.contract';
import { SpecialistDetailsResponse } from '../contracts/specialist-details.contract';
import {
  OnboardSpecialistRequest,
  OnboardSpecialistResponse
} from '../contracts/specialist-onboard.contract';
import { SpecialistReviewResponse } from '../contracts/specialist-review.contract';

import { SpecialistProfileResponse } from '../contracts/specialist-profile-response';
import { SpecialistEarningsResponse } from '../contracts/specialist-earnings-response';
import { SpecialistDashboardResponse } from '../contracts/specialist-dashboard-response';
import { SpecialistReviewsResponse } from '../contracts/specialist-reviews-response';

@Injectable({
  providedIn: 'root',
})
export class SpecialistApiService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiBaseUrl;

  getMyProfile() {
    return this.http.get<{
      data: SpecialistProfileResponse;
    }>(`${this.apiUrl}/specialists/me`);
  }

  getDashboard() {
    return this.http.get<{
      data: SpecialistDashboardResponse;
    }>(
      `${this.apiUrl}/specialists/me/dashboard`
    );
  }

  getMyEarnings() {
    return this.http.get<SpecialistEarningsResponse>(
      `${this.apiUrl}/specialists/me/earnings`
    );
  }

  getMyReviews(pageNumber = 1, pageSize = 10) {
    return this.http.get<{
      data: SpecialistReviewsResponse;
    }>(
      `${this.apiUrl}/specialists/me/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class SpecialistsApiService {
  private readonly http = inject(HttpClient);

  getExpertise() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.lookup.expertise
    );
  }

  getSkills() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.lookup.skills
    );
  }

  getTools() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.lookup.tools
    );
  }

  getIndustries() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.lookup.industries
    );
  }

  getSpecialists(filters: SpecialistsFilters) {
    const params = buildHttpParams(filters);

    return this.http.get<
      ApiResponse<PaginatedResponse<SpecialistResponse>>
    >(
      API_ENDPOINTS.specialists.all,
      { params }
    );
  }

  getSpecialistById(id: string) {
    return this.http.get<
      ApiResponse<SpecialistDetailsResponse>
    >(
      API_ENDPOINTS.specialists.byId(id)
    );
  }

getReviews(id: string) {
  return this.http.get<
    ApiResponse<SpecialistReviewsResponse>
  >(
    API_ENDPOINTS.specialists.reviewsFor(id)
  );
}

  getAvailability(id: string) {
    return this.http.get<
      ApiResponse<SpecialistAvailabilityResponse[]>
    >(
      API_ENDPOINTS.specialists.availabilityFor(id)
    );
  }

  onboard(request: OnboardSpecialistRequest) {
    return this.http.post<
      ApiResponse<OnboardSpecialistResponse>
    >(
      API_ENDPOINTS.specialists.onboard,
      request
    );
  }

  addExpertise(expertiseId: string) {
    return this.http.post(
      API_ENDPOINTS.specialists.expertise,
      { expertiseId }
    );
  }

  addSkill(skillId: string) {
    return this.http.post(
      API_ENDPOINTS.specialists.skills,
      { skillId }
    );
  }

  addTool(toolId: string) {
    return this.http.post(
      API_ENDPOINTS.specialists.tools,
      { toolId }
    );
  }

  addAvailability(
    start: string,
    end: string,
  ) {
    return this.http.post(
      API_ENDPOINTS.specialists.availability,
      {
        start,
        end,
      }
    );
  }
}