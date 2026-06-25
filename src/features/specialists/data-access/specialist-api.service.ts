import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../src/environments/environment';
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