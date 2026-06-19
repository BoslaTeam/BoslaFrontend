import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { SelectOption } from '@shared/types/select-option.type';
import { Button } from '@shared/ui/button/button';
import { Checkbox } from '@shared/ui/checkbox/checkbox';
import { Select } from '@shared/ui/select/select';
import { InputComponent } from '@shared/ui/input/input';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, Button, Select, Checkbox],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly roleOptions: SelectOption[] = [
    { label: 'Client (Looking for a consultant)', value: String(UserRole.User) },
    { label: 'Expert Consultant (Providing advice)', value: String(UserRole.Specialist) },
  ];

  protected readonly registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    role: [String(UserRole.User), [Validators.required]],
  }, {
    validators: this.passwordMatchValidator
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (confirmPassword?.errors && !confirmPassword.errors['mismatch']) {
      return null;
    }

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { fullName, email, password, role } = this.registerForm.value;
    
    this.authService.register({
      fullName,
      email,
      password,
      role: Number(role) as UserRole
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        const user = response.data.user;
        
        // Navigation Matrix Routing based on Role
        if (user.role === 1) {
          this.router.navigate(['/specialist']);
        } else if (user.role === 2) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || 'An error occurred while creating your account. Please try again.'
        );
      },
    });
  }
}