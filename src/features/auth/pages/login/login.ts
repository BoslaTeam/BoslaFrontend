import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NavigationService } from '../../../../core/navigation/navigation.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_CONFIG } from '../../../../core/config/auth.config';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);
  protected t = inject(TranslationService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly isLoading = signal(false);
  errorMessage = '';

  private googleClientId = environment.googleClientId;

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
      { theme: 'outline', size: 'large' }
    );
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.isLoading.set(true);
      this.errorMessage = '';

      this.authService.googleLogin({ idToken: response.credential }).subscribe({
        next: (res) => {
          if (res.success) {
            this.authService.refreshSpecialistStatusAsync().subscribe(() => {
              this.navigationService.redirectAfterLogin();
            });
          } else {
            this.errorMessage = res.message || this.t.translate('auth.login.error.googleFailed');
          }
          this.isLoading.set(false);
        },
        error: (err: any) => {
          this.errorMessage = err.title || this.t.translate('auth.login.error.googleAuth');
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
      this.authService.login({ email: email!, password: password! }).subscribe({
        next: (res) => {
          if (res.success) {
            this.authService.refreshSpecialistStatusAsync().subscribe(() => {
              this.navigationService.redirectAfterLogin();
            });
          } else if (res.message) {
            this.errorMessage = res.message;
          }
          this.isLoading.set(false);
        },
      error: (err: any) => {
        console.error('[Login] Error:', err);
        if (err.status === 0) {
          this.errorMessage = this.t.translate('common.error.serverDown');
        } else if (err.status === 403 || err.status === 401) {
          this.errorMessage = err.title || this.t.translate('auth.login.error.invalidCredentials');
        } else if (err.status === 400) {
          const validationErrors = err.errors;
          if (validationErrors) {
            this.errorMessage = Object.values(validationErrors).flat().join(', ');
          } else {
            this.errorMessage = err.title || this.t.translate('common.error.validation');
          }
        } else {
          this.errorMessage = err.title || this.t.translate('common.error.serverError', err.status.toString());
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
