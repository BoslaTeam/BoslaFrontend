import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecialistsApiService } from '../../data-access/specialist-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-specialist-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specialist-onboarding.html',
  styleUrl: './specialist-onboarding.css'
})
export class SpecialistOnboarding {
  private fb = inject(FormBuilder);
  private specialistApi = inject(SpecialistsApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onboardingForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.onboardingForm = this.fb.group({
      yearsOfExperience: ['', [Validators.required, Validators.min(0)]],
      hourlyRate: ['', [Validators.required, Validators.min(1)]],
      bookingPolicy: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.onboardingForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.specialistApi.onboard(this.onboardingForm.value).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // Trigger token refresh to get Specialist role
            const isAuthenticated = this.authService.isAuthenticated();
            if (isAuthenticated) {
              this.authService.refreshToken().subscribe({
                next: () => {
                  this.isLoading = false;
                  this.router.navigate(['/specialist']);
                },
                error: (err) => {
                  console.error('Failed to refresh token after onboarding', err);
                  this.isLoading = false;
                  // Even if refresh fails, they might just need to re-login
                  alert('تم إنشاء حساب الاختصاصي. يرجى تسجيل الدخول مجدداً لتفعيل الصلاحيات.');
                  this.authService.logout();
                }
              });
            } else {
              this.isLoading = false;
              this.router.navigate(['/specialist']);
            }
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.title || 'حدث خطأ أثناء الانضمام. يرجى المحاولة مرة أخرى.';
          this.isLoading = false;
        }
      });
    } else {
      this.onboardingForm.markAllAsTouched();
    }
  }
}
