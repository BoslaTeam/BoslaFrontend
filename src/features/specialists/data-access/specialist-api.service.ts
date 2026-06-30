
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
import { AddAvailabilitiesRequest, SpecialistAvailabilityResponse } from '../contracts/specialist-availability.contract';
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
import { AddSkillsRequest } from '../contracts/specialist-skill.contract';
import { AddExperiencesRequest, ExperienceResponse } from '../contracts/specialist-experience.contract';
import { AddToolsRequest } from '../contracts/specialist-tool.contract';

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
    API_ENDPOINTS.specialists.dashboard
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
    `${API_ENDPOINTS.specialists.myReviews}?pageNumber=${pageNumber}&pageSize=${pageSize}`
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

  addSkills(request: AddSkillsRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.skills,
      request
    );
  }

  removeSkill(id: string) {
    return this.http.delete(
      API_ENDPOINTS.specialists.skillById(id)
    );
  }

  addTools(request: AddToolsRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.tools,
      request
    );
  }

  removeTool(id: string) {
    return this.http.delete(
      API_ENDPOINTS.specialists.toolById(id)
    );
  }

  addAvailabilities(request: AddAvailabilitiesRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.availability,
      request
    );
  }

  deleteAvailability(id: string) {
    return this.http.delete(
      API_ENDPOINTS.specialists.availabilityById(id)
    );
  }

  addExperiences(request: AddExperiencesRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.experience,
      request
    );
  }

  removeExperience(id: string) {
    return this.http.delete(
      API_ENDPOINTS.specialists.experienceById(id)
    );
  }

  // ==========================================
  // My Profile Queries
  // ==========================================

  getMyProfile() {
    return this.http.get<ApiResponse<SpecialistDetailsResponse>>(
      API_ENDPOINTS.specialists.me
    );
  }

  getMyExperience() {
    return this.http.get<ApiResponse<ExperienceResponse[]>>(
      API_ENDPOINTS.specialists.experience
    );
  }

  getMyAvailability() {
    return this.http.get<ApiResponse<SpecialistAvailabilityResponse[]>>(
      API_ENDPOINTS.specialists.availability
    );
  }

  getMySkills() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.specialists.skills
    );
  }

  getMyTools() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.specialists.tools
    );
  }
}