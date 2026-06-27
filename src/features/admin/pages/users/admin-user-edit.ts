import { Component, inject, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-user-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-create.css',
})
export class AdminUserEdit implements OnInit {
  readonly id = input.required<string>();

  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = false;
  readonly isSubmitting = false;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    phoneNumber: [''],
    country: [''],
    title: [''],
    bio: [''],
    gender: [''],
    preferredLanguage: [''],
    isActive: [true],
    role: [0, [Validators.required]],
  });

  ngOnInit(): void {
    this.adminService.getUserDetail(this.id()).subscribe({
      next: (user) => {
        this.form.patchValue({
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          country: user.country,
          title: user.title,
          bio: user.bio,
          gender: user.gender,
          preferredLanguage: user.preferredLanguage,
          isActive: user.isActive,
          role: user.role
        });
      },
      error: () => {
        this.router.navigate(['/admin/users']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.adminService.updateUser(this.id(), this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error updating user:', err);
      }
    });
  }
}
