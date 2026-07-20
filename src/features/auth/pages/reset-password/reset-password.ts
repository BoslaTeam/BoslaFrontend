import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);

  email = '';
  token = '';

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]]
  });

  isLoading = false;
  message = '';
  isSuccess = false;

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.email || !this.token) {
      this.message = this.translationService.translate('auth.resetPassword.invalidLink');
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.email || !this.token) return;

    this.isLoading = true;
    this.message = '';

    this.authService.resetPassword({ 
      email: this.email, 
      token: this.token, 
      newPassword: this.form.value.newPassword! 
    }).subscribe({
      next: (res) => {
        this.isSuccess = true;
        this.message = res.message || this.translationService.translate('auth.resetPassword.successMessage');
        this.isLoading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err: any) => {
        this.message = err.title || this.translationService.translate('auth.resetPassword.errorMessage');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
