import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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
        this.message = res.message || 'If an account exists, a reset token has been sent.';
        this.isLoading = false;
      },
      error: () => {
        this.message = 'An error occurred. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
