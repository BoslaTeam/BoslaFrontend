import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SpecialistOnboardRequest,
  SpecialistOnboardResponse,
  SpecialistProfileResponse,
  AvailabilityResponse,
  AddAvailabilityRequest,
  ExperienceDto,
  AddExperienceRequestDTO,
  UpdateExperienceRequest,
  AddExpertiseRequest,
  AddSkillRequest,
  UpdateCancellationPolicyRequest,
  UpdateBookingPolicyRequest
} from '../models/specialist.contracts';

@Injectable({
  providedIn: 'root'
})
export class SpecialistApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/v1/specialists`;

  // Onboarding
  onboard(request: SpecialistOnboardRequest): Observable<SpecialistOnboardResponse> {
    return this.http.post<SpecialistOnboardResponse>(`${this.baseUrl}/onboard`, request);
  }

  // Profile
  getProfile(): Observable<SpecialistProfileResponse> {
    return this.http.get<SpecialistProfileResponse>(`${this.baseUrl}/me`);
  }

  updateProfile(request: any): Observable<SpecialistProfileResponse> {
    return this.http.put<SpecialistProfileResponse>(`${this.baseUrl}/me`, request);
  }

  // Availability
  getAvailability(): Observable<AvailabilityResponse[]> {
    return this.http.get<AvailabilityResponse[]>(`${this.baseUrl}/me/availability`);
  }

  addAvailability(request: AddAvailabilityRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/me/availability`, request);
  }

  deleteAvailability(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/me/availability/${id}`);
  }

  // Experience
  getExperience(): Observable<ExperienceDto[]> {
    return this.http.get<ExperienceDto[]>(`${this.baseUrl}/me/experience`);
  }

  addExperience(request: AddExperienceRequestDTO): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/me/experience`, request);
  }

  updateExperience(id: string, request: UpdateExperienceRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/me/experience/${id}`, request);
  }

  deleteExperience(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/me/experience/${id}`);
  }

  // Skills & Expertise
  addExpertise(request: AddExpertiseRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/me/expertise`, request);
  }

  deleteExpertise(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/me/expertise/${id}`);
  }

  addSkill(request: AddSkillRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/me/skills`, request);
  }

  deleteSkill(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/me/skills/${id}`);
  }

  // Policies
  updateCancellationPolicy(request: UpdateCancellationPolicyRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/me/cancellation-policy`, request);
  }

  updateBookingPolicy(request: UpdateBookingPolicyRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/me/booking-policy`, request);
  }
}
