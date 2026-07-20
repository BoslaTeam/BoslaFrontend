import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  message = '';

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.invalid) return;

    this.isLoading = true;
    this.message = '';

    this.authService.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: (res) => {
        this.message = res.message || this.translationService.translate('auth.forgotPassword.sentMessage');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message = err.title || this.translationService.translate('auth.forgotPassword.errorMessage');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
