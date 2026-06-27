import { inject, Injectable } from "@angular/core";
import { API_ENDPOINTS } from "@core/constants/api-endpoints";
import { ApiResponse } from "@core/models/api-response.model";
import { LookupResponse } from "../contracts/lookup.contract";
import { HttpClient } from "@angular/common/http";
import { SpecialistsFilters } from "../contracts/specialist-filters.contract";
import { buildHttpParams } from "@core/utils/http-params.util";
import { SpecialistResponse } from "../contracts/specialist.contract";
import { SpecialistAvailabilityResponse } from "../contracts/specialist-availability.contract";
import { SpecialistDetailsResponse } from "../contracts/specialist-details.contract";
import { OnboardSpecialistRequest, OnboardSpecialistResponse } from "../contracts/specialist-onboard.contract";
import { SpecialistReviewResponse } from "../contracts/specialist-review.contract";
import { PaginatedResponse } from "@core/models/paginated-response.model";
import { AddSkillsRequest } from "../contracts/specialist-skill.contract";
import { AddToolsRequest } from "../contracts/specialist-tool.contract";
import { AddExperiencesRequest, ExperienceResponse } from "../contracts/specialist-experience.contract";
import { AddAvailabilitiesRequest } from "../contracts/specialist-availability.contract";

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
      ApiResponse<SpecialistReviewResponse[]>
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

  onboard(
    request: OnboardSpecialistRequest
  ) {
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

  addTools(request: AddToolsRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.tools,
      request
    );
  }

  addAvailabilities(request: AddAvailabilitiesRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.availability,
      request
    );
  }

  addExperiences(request: AddExperiencesRequest) {
    return this.http.post(
      API_ENDPOINTS.specialists.experience,
      request
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
