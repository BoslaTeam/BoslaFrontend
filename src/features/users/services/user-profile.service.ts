import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { 
  UserProfileDto, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  SetPasswordRequest,
  EducationDto,
  AddEducationRequest,
  UpdateEducationRequest,
  SocialLinkDto,
  AddSocialLinkRequest
} from '../contracts/user.contracts';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users`;

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<ApiResponse<UserProfileDto>>(`${this.baseUrl}/me`)
      .pipe(map(res => res.data));
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfileDto> {
    return this.http.put<ApiResponse<UserProfileDto>>(`${this.baseUrl}/me`, request)
      .pipe(map(res => res.data));
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/me/password`, request)
      .pipe(map(res => res.data));
  }

  setPassword(request: SetPasswordRequest): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/me/set-password`, request)
      .pipe(map(res => res.data));
  }

  getEducation(): Observable<EducationDto[]> {
    return this.http.get<ApiResponse<EducationDto[]>>(`${this.baseUrl}/me/education`)
      .pipe(map(res => res.data));
  }

  addEducation(request: AddEducationRequest): Observable<EducationDto> {
    return this.http.post<ApiResponse<EducationDto>>(`${this.baseUrl}/me/education`, request)
      .pipe(map(res => res.data));
  }

  updateEducation(id: string, request: UpdateEducationRequest): Observable<EducationDto> {
    return this.http.put<ApiResponse<EducationDto>>(`${this.baseUrl}/me/education/${id}`, request)
      .pipe(map(res => res.data));
  }

  deleteEducation(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/me/education/${id}`)
      .pipe(map(res => res.data));
  }

  getSocialLinks(): Observable<SocialLinkDto[]> {
    return this.http.get<ApiResponse<SocialLinkDto[]>>(`${this.baseUrl}/me/social-links`)
      .pipe(map(res => res.data));
  }

  addSocialLink(request: AddSocialLinkRequest): Observable<SocialLinkDto> {
    return this.http.post<ApiResponse<SocialLinkDto>>(`${this.baseUrl}/me/social-links`, request)
      .pipe(map(res => res.data));
  }

  deleteSocialLink(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/me/social-links/${id}`)
      .pipe(map(res => res.data));
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/me/profile-picture`, formData);
  }
}

