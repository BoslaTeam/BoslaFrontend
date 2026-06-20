import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  // TODO: Replace with actual Google Client ID
  private googleClientId = '818109149867-jlbj83dcs95rknac2g38asnefamefj5o.apps.googleusercontent.com';

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) return;

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: this.handleGoogleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn-wrapper'),
      { theme: 'outline', size: 'large', width: '100%' } // Customize button as needed
    );
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.googleLogin({ idToken: response.credential }).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/']);
          } else {
            this.errorMessage = res.message || 'Google Login failed.';
            this.isLoading = false;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.title || 'Failed to authenticate with Google.';
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    console.log('[Login] Sending request to:', `/api/v1/auth/login`);

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        console.log('[Login] Response:', res);
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.message || 'Login failed.';
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[Login] Error:', err);
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (err.status === 403) {
          this.errorMessage = err.error?.title || 'Invalid email or password.';
        } else if (err.status === 400) {
          const validationErrors = err.error?.errors;
          if (validationErrors) {
            this.errorMessage = Object.values(validationErrors).flat().join(', ');
          } else {
            this.errorMessage = err.error?.title || 'Validation error.';
          }
        } else {
          this.errorMessage = err.error?.title || `Server error (${err.status})`;
        }
        this.isLoading = false;
      }
    });
  }
}

