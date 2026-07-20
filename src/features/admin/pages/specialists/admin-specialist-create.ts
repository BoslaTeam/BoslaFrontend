import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-specialist-create',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-specialist-create.html',
  styleUrl: './admin-specialist-create.css',
})
export class AdminSpecialistCreate implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly expertiseList = signal<{ id: string; name: string }[]>([]);
  readonly industryList = signal<{ id: string; name: string }[]>([]);
  readonly skillList = signal<{ id: string; name: string }[]>([]);
  readonly toolList = signal<{ id: string; name: string }[]>([]);
  readonly isLoadingLookups = signal(true);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: [''],
    country: [''],
    title: [''],
    bio: [''],
    gender: [''],
    preferredLanguage: [''],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    experienceLevel: ['Mid', [Validators.required]],
    hourlyRate: [0, [Validators.required, Validators.min(0)]],
    bookingPolicy: [''],
    expertiseIds: [[] as string[]],
    industryIds: [[] as string[]],
    skillIds: [[] as string[]],
    toolIds: [[] as string[]],
  });

  ngOnInit(): void {
    this.loadLookups();
  }

  private loadLookups(): void {
    this.isLoadingLookups.set(true);
    this.adminService.getExpertiseList().subscribe((items) => this.expertiseList.set(items));
    this.adminService.getIndustryList().subscribe((items) => this.industryList.set(items));
    this.adminService.getSkillList().subscribe((items) => this.skillList.set(items));
    this.adminService.getToolList().subscribe({
      next: (items) => { this.toolList.set(items); this.isLoadingLookups.set(false); },
      error: () => this.isLoadingLookups.set(false),
    });
  }

  toggleSelection(field: 'expertiseIds' | 'industryIds' | 'skillIds' | 'toolIds', id: string): void {
    const current = this.form.get(field)?.value as string[] || [];
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    this.form.patchValue({ [field]: updated });
  }

  isSelected(field: 'expertiseIds' | 'industryIds' | 'skillIds' | 'toolIds', id: string): boolean {
    return (this.form.get(field)?.value as string[] || []).includes(id);
  }

  goBack(): void {
    this.router.navigate(['/admin/specialists']);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    this.adminService.createSpecialist(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/admin/specialists']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
