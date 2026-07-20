
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
  StartResponse,
  UpdateProfileRequest,
} from '../contracts/specialist-onboard.contract';
import { SpecialistReviewResponse } from '../contracts/specialist-review.contract';

import { SpecialistProfileResponse } from '../contracts/specialist-profile-response';
import { SpecialistEarningsResponse } from '../contracts/specialist-earnings-response';
import { SpecialistDashboardResponse } from '../contracts/specialist-dashboard-response';
import { SpecialistReviewsResponse } from '../contracts/specialist-reviews-response';
import { AddSkillsRequest } from '../contracts/specialist-skill.contract';
import { AddExperiencesRequest, ExperienceResponse } from '../contracts/specialist-experience.contract';
import { AddToolsRequest } from '../contracts/specialist-tool.contract';
import { UpdateSpecialistRequest, UpdateBookingPolicyRequest, UpdateCancellationPolicyRequest, UpdateExperienceRequest } from '../contracts/specialist-profile-update.contract';
import { VerificationDetailsResponse } from '../contracts/specialist-verification.contract';
import { SpecialistDocumentResponse } from '../contracts/specialist-document.contract';
import { PortfolioItemDto, CreatePortfolioItemRequest, UpdatePortfolioItemRequest, ReorderPortfolioRequest } from '../contracts/specialist-portfolio.contract';

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

  getCertificates(id: string) {
    return this.http.get<
      ApiResponse<SpecialistDocumentResponse[]>
    >(
      API_ENDPOINTS.specialists.certificatesFor(id)
    );
  }

  start() {
    return this.http.post<ApiResponse<StartResponse>>(
      API_ENDPOINTS.specialists.start,
      {}
    );
  }

  updateProfile(request: UpdateProfileRequest) {
    return this.http.put<ApiResponse<SpecialistProfileResponse>>(
      API_ENDPOINTS.specialists.updateProfile,
      request
    );
  }

  updateUserTitle(title: string) {
    return this.http.put<ApiResponse<unknown>>(
      API_ENDPOINTS.users.me,
      { title }
    );
  }

  submitForReview() {
    return this.http.post<ApiResponse<void>>(
      API_ENDPOINTS.specialists.submit,
      {}
    );
  }

  getVerification() {
    return this.http.get<ApiResponse<VerificationDetailsResponse>>(
      API_ENDPOINTS.specialists.verification
    );
  }

  uploadDocument(file: File, type: number) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(
      `${API_ENDPOINTS.specialists.documents}?type=${type}`,
      formData
    );
  }

  getDocuments() {
    return this.http.get<ApiResponse<SpecialistDocumentResponse[]>>(
      API_ENDPOINTS.specialists.documents
    );
  }

  deleteDocument(id: string) {
    return this.http.delete<ApiResponse<void>>(
      API_ENDPOINTS.specialists.documentById(id)
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

  removeExpertise(id: string) {
    return this.http.delete(
      API_ENDPOINTS.specialists.expertiseById(id)
    );
  }

  updateMyProfile(request: UpdateSpecialistRequest) {
    return this.http.put<ApiResponse<SpecialistProfileResponse>>(
      API_ENDPOINTS.specialists.me,
      request
    );
  }

  updateBookingPolicy(request: UpdateBookingPolicyRequest) {
    return this.http.put<ApiResponse<boolean>>(
      API_ENDPOINTS.specialists.bookingPolicy,
      request
    );
  }

  updateCancellationPolicy(request: UpdateCancellationPolicyRequest) {
    return this.http.put<ApiResponse<boolean>>(
      API_ENDPOINTS.specialists.cancellationPolicy,
      request
    );
  }

  updateExperience(id: string, request: UpdateExperienceRequest) {
    return this.http.put<ApiResponse<boolean>>(
      API_ENDPOINTS.specialists.experienceById(id),
      request
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
  // Portfolio
  // ==========================================

  getMyPortfolio() {
    return this.http.get<ApiResponse<PortfolioItemDto[]>>(API_ENDPOINTS.portfolio.myPortfolio);
  }

  createPortfolioItem(request: CreatePortfolioItemRequest) {
    return this.http.post<ApiResponse<PortfolioItemDto>>(API_ENDPOINTS.portfolio.myPortfolio, request);
  }

  updatePortfolioItem(id: string, request: UpdatePortfolioItemRequest) {
    return this.http.put<ApiResponse<PortfolioItemDto>>(API_ENDPOINTS.portfolio.myPortfolioItem(id), request);
  }

  deletePortfolioItem(id: string) {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.portfolio.myPortfolioItem(id));
  }

  reorderPortfolio(request: ReorderPortfolioRequest) {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.portfolio.reorder, request);
  }

  getPublicPortfolio(specialistId: string) {
    return this.http.get<ApiResponse<PortfolioItemDto[]>>(API_ENDPOINTS.portfolio.public(specialistId));
  }

  getPublicPortfolioItem(specialistId: string, itemId: string) {
    return this.http.get<ApiResponse<PortfolioItemDto>>(API_ENDPOINTS.portfolio.publicItem(specialistId, itemId));
  }

  uploadPortfolioImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.portfolio.uploadImage, formData);
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

  getMyExpertise() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.specialists.expertise
    );
  }

  getMyTools() {
    return this.http.get<ApiResponse<LookupResponse[]>>(
      API_ENDPOINTS.specialists.tools
    );
  }
}