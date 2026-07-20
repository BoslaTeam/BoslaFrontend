import { Component, inject, ChangeDetectorRef, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RegisterRequest } from '../../contracts/auth.contracts';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    phoneNumber: ['', [Validators.required]],
    country: ['', [Validators.required]]
  });

  selectedRole = signal<'user' | 'specialist'>('user');
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  isLoading = false;
  errorMessage = '';

  selectRole(role: 'user' | 'specialist') {
    this.selectedRole.set(role);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    const req: RegisterRequest = {
      ...formValue,
      name: `${formValue.firstName} ${formValue.lastName}`,
      preferredLanguage: this.translationService.currentLang(),
      role: this.selectedRole()
    } as RegisterRequest;

    this.authService.register(req).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/auth/check-email'], { queryParams: { email: req.email } });
        } else {
          this.errorMessage = res.message || this.translationService.translate('auth.register.error.failed');
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        console.error('[Register] Error:', err);
        if (err.status === 0) {
          this.errorMessage = this.translationService.translate('common.error.serverDown');
        } else if (err.status === 409) {
          this.errorMessage = err.title || this.translationService.translate('auth.register.error.emailExists');
        } else if (err.status === 400) {
          const validationErrors = err.errors;
          if (validationErrors) {
            this.errorMessage = Object.values(validationErrors).flat().join(', ');
          } else {
            this.errorMessage = err.title || this.translationService.translate('common.error.validation');
          }
        } else {
          this.errorMessage = err.title || this.translationService.translate('common.error.serverError', err.status.toString());
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
