import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_CONFIG } from '../../../../core/config/auth.config';
import { UserRole } from '../../../../core/enums/user-role.enum';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../../auth.css'
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly isLoading = signal(false);
  errorMessage = '';

  // TODO: Replace with actual Google Client ID
  private googleClientId = '818109149867-jlbj83dcs95rknac2g38asnefamefj5o.apps.googleusercontent.com';

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
      return;
    }

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: this.handleGoogleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn-wrapper'),
      { theme: 'outline', size: 'large' } // Customize button as needed
    );
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.isLoading.set(true);
      this.errorMessage = '';

      this.authService.googleLogin({ idToken: response.credential }).subscribe({
        next: (res) => {
          if (res.success) {
            this.authService.redirectByRole();
          } else {
            this.errorMessage = res.message || 'Google Login failed.';
          }
          this.isLoading.set(false);
        },
        error: (err: any) => {
          this.errorMessage = err.title || 'Failed to authenticate with Google.';
          this.isLoading.set(false);
        }
      });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    console.log('[Login] Sending request to:', `/api/v1/auth/login`);

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        console.log('[Login] Response:', res);
        if (res.success) {
          this.authService.redirectByRole();
        } else if (res.message) {
          this.errorMessage = res.message;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('[Login] Error:', err);
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (err.status === 403 || err.status === 401) {
          this.errorMessage = err.title || 'Invalid email or password.';
        } else if (err.status === 400) {
          const validationErrors = err.errors;
          if (validationErrors) {
            this.errorMessage = Object.values(validationErrors).flat().join(', ');
          } else {
            this.errorMessage = err.title || 'Validation error.';
          }
        } else {
          this.errorMessage = err.title || `Server error (${err.status})`;
        }
        this.isLoading.set(false);
      }
    });
  }

  private getRedirectUrl(): string {
    const role = this.authService.userRole();
    if (role !== null && role !== undefined) {
      const redirect = AUTH_CONFIG.defaultRedirectByRole[role as keyof typeof AUTH_CONFIG.defaultRedirectByRole];
      if (redirect) return redirect;
    }
    return '/';
  }
}
