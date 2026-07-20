import { Component, inject, OnInit, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-specialist-edit',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-specialist-edit.html',
  styleUrl: './admin-specialist-create.css',
})
export class AdminSpecialistEdit implements OnInit {
  readonly id = input.required<string>();

  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly expertiseList = signal<{ id: string; name: string }[]>([]);
  readonly industryList = signal<{ id: string; name: string }[]>([]);
  readonly isLoadingLookups = signal(true);
  readonly isLoadingSpecialist = signal(true);
  readonly isSubmitting = signal(false);
  readonly notFound = signal(false);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    phoneNumber: [''],
    country: [''],
    title: [''],
    bio: [''],
    gender: [''],
    preferredLanguage: [''],
    experienceYears: [0, [Validators.min(0)]],
    experienceLevel: [''],
    hourlyRate: [0, [Validators.min(0)]],
    bookingPolicy: [''],
    verificationStatus: [''],
    expertiseIds: [[] as string[]],
    industryIds: [[] as string[]],
  });

  ngOnInit(): void {
    this.loadLookups();
    this.loadSpecialist();
  }

  private loadLookups(): void {
    this.adminService.getExpertiseList().subscribe({ next: (items) => this.expertiseList.set(items), error: () => {} });
    this.adminService.getIndustryList().subscribe({
      next: (items) => this.industryList.set(items),
    });
  }

  private loadSpecialist(): void {
    this.isLoadingSpecialist.set(true);
    this.adminService.getSpecialistDetail(this.id()).subscribe({
      next: (specialist) => {
        this.form.patchValue({
          fullName: specialist.fullName,
          phoneNumber: specialist.country ?? '', // preserve field mapping
          country: specialist.country,
          title: specialist.title,
          bio: specialist.bio,
          gender: specialist.gender,
          preferredLanguage: specialist.preferredLanguage,
          experienceYears: specialist.experienceYears,
          experienceLevel: specialist.experienceLevel,
          hourlyRate: specialist.hourlyRate,
          bookingPolicy: '',
          verificationStatus: specialist.verificationStatus,
          expertiseIds: [],
          industryIds: [],
        });
        this.isLoadingSpecialist.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoadingSpecialist.set(false);
      },
    });
  }

  toggleSelection(field: 'expertiseIds' | 'industryIds', id: string): void {
    const current = this.form.get(field)?.value as string[] || [];
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    this.form.patchValue({ [field]: updated });
  }

  isSelected(field: 'expertiseIds' | 'industryIds', id: string): boolean {
    return (this.form.get(field)?.value as string[] || []).includes(id);
  }

  goBack(): void {
    this.router.navigate(['/admin/specialists', this.id()]);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    const payload: Record<string, any> = {};
    const raw = this.form.value;
    for (const [key, value] of Object.entries(raw)) {
      if (value !== null && value !== undefined && value !== '') {
        payload[key] = value;
      }
    }

    this.adminService.updateSpecialist(this.id(), payload).subscribe({
      next: () => {
        this.router.navigate(['/admin/specialists', this.id()]);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
