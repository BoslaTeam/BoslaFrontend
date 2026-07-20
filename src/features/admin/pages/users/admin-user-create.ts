import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-user-create',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-user-create.html',
  styleUrl: './admin-user-create.css',
})
export class AdminUserCreate {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = false;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: [''],
    country: [''],
    role: [0, [Validators.required]],
  });

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // TODO: submit logic
    this.adminService.createUser(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error creating user:', err);
      }
    });
  }
}
