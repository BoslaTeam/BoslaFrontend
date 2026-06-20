import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { RegisterRequest } from '../../contracts/auth.contracts';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    phoneNumber: ['', [Validators.required]],
    country: ['', [Validators.required]],
    role: ['user', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    const req: RegisterRequest = {
      ...formValue,
      name: `${formValue.firstName} ${formValue.lastName}`
    } as RegisterRequest;
    console.log('[Register] Sending request:', req);

    this.authService.register(req).subscribe({
      next: (res) => {
        console.log('[Register] Response:', res);
        if (res.success) {
          this.router.navigate(['/auth/check-email'], { queryParams: { email: req.email } });
        } else {
          this.errorMessage = res.message || 'Registration failed.';
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[Register] Error:', err);
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (err.status === 409) {
          this.errorMessage = err.error?.title || 'Email already exists.';
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
