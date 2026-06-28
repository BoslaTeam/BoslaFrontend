import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

import { SpecialistProfileStore } from '../../store/specialist-profile.store';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { SpecialistReviewsResponse } from '../../contracts/specialist-reviews-response';
import { AuthService } from '@core/services/auth.service';
import { UserProfileService } from '../../../users/services/user-profile.service';
import { EducationDto, AddEducationRequest, SocialLinkDto, AddSocialLinkRequest } from '../../../users/contracts/user.contracts';
import { SpecialistsRepository } from '../../data-access/specialist.repository';
import { LookupItem } from '../../models/lookup.model';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './specialist-profile.html',
})
export class SpecialistProfilePage implements OnInit {
  readonly profileStore = inject(SpecialistProfileStore);
  protected readonly authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private specialistsRepo = inject(SpecialistsRepository);
  private specialistApi = inject(SpecialistApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  activeTab: 'basic' | 'professional' | 'availability' | 'reviews' | 'security' = 'basic';

  basicInfoForm: FormGroup;
  passwordForm: FormGroup;
  skillForm: FormGroup;
  toolForm: FormGroup;
  experienceForm: FormGroup;
  educationForm: FormGroup;
  socialLinkForm: FormGroup;

  avatarPreviewUrl: string | null = null;
  profileImageError = false;

  availableSkills = signal<LookupItem[]>([]);
  availableTools = signal<LookupItem[]>([]);
  educationList = signal<EducationDto[]>([]);
  socialLinksList = signal<SocialLinkDto[]>([]);
  reviewsData = signal<SpecialistReviewsResponse | null>(null);

  constructor() {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [''],
      country: [''],
      title: [''],
      bio: [''],
      gender: [''],
      preferredLanguage: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.skillForm = this.fb.group({
      skillId: ['', Validators.required]
    });

    this.toolForm = this.fb.group({
      toolId: ['', Validators.required]
    });

    this.experienceForm = this.fb.group({
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      description: [''],
      fromDate: ['', Validators.required],
      toDate: ['']
    });

    this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      startYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
      endYear: ['']
    });

    this.socialLinkForm = this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });

    merge(
      this.basicInfoForm.statusChanges, this.basicInfoForm.valueChanges,
      this.passwordForm.statusChanges, this.passwordForm.valueChanges,
      this.experienceForm.statusChanges, this.experienceForm.valueChanges
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    this.profileStore.loadMyData();
    this.loadLookups();
    this.loadEducation();
    this.loadSocialLinks();
    this.loadReviews();

    this.userProfileService.getProfile().subscribe(res => {
      this.basicInfoForm.patchValue({
        name: res.name,
        phoneNumber: res.phoneNumber,
        country: res.country,
        title: res.title || '',
        bio: res.bio || '',
        gender: res.gender || '',
        preferredLanguage: res.preferredLanguage || ''
      });
      this.avatarPreviewUrl = res.profilePictureUrl || this.authService.currentUser()?.avatarUrl || null;
      this.cdr.markForCheck();
    });
  }

  private loadLookups() {
    this.specialistsRepo.getSkills().subscribe(data => this.availableSkills.set(data));
    this.specialistsRepo.getTools().subscribe(data => this.availableTools.set(data));
  }

  private loadEducation() {
    this.userProfileService.getEducation().subscribe(data => this.educationList.set(data));
  }

  private loadSocialLinks() {
    this.userProfileService.getSocialLinks().subscribe(data => this.socialLinksList.set(data));
  }

  private loadReviews() {
    this.specialistApi.getMyReviews().subscribe(res => {
      this.reviewsData.set(res.data);
      this.cdr.markForCheck();
    });
  }

  setTab(tab: 'basic' | 'professional' | 'availability' | 'reviews' | 'security') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  updateBasicInfo() {
    if (this.basicInfoForm.valid) {
      this.userProfileService.updateProfile(this.basicInfoForm.value).subscribe(() => {
        this.profileStore.loadMyProfile();
        this.cdr.markForCheck();
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      const request$ = currentPassword 
        ? this.userProfileService.changePassword({ currentPassword, newPassword })
        : this.userProfileService.setPassword({ newPassword });
      
      request$.subscribe({
        next: () => {
          this.passwordForm.reset();
          this.cdr.markForCheck();
        },
        error: () => {}
      });
    }
  }

  // ─── Skills ──────────────────────────────────────────

  addSkill() {
    if (this.skillForm.valid) {
      const skillId = this.skillForm.value.skillId;
      this.specialistsRepo.addSkills([skillId]).subscribe(() => {
        this.profileStore.loadMySkills();
        this.skillForm.reset();
        this.cdr.markForCheck();
      });
    }
  }

  removeSkill(skillId: string) {
    this.specialistsRepo.removeSkill(skillId).subscribe(() => {
      this.profileStore.loadMySkills();
      this.cdr.markForCheck();
    });
  }

  // ─── Tools ───────────────────────────────────────────

  addTool() {
    if (this.toolForm.valid) {
      const toolId = this.toolForm.value.toolId;
      this.specialistsRepo.addTools([toolId]).subscribe(() => {
        this.profileStore.loadMyTools();
        this.toolForm.reset();
        this.cdr.markForCheck();
      });
    }
  }

  removeTool(toolId: string) {
    this.specialistsRepo.removeTool(toolId).subscribe(() => {
      this.profileStore.loadMyTools();
      this.cdr.markForCheck();
    });
  }

  // ─── Experiences ─────────────────────────────────────

  addExperience() {
    if (this.experienceForm.valid) {
      this.specialistsRepo.addExperiences([this.experienceForm.value]).subscribe(() => {
        this.profileStore.loadMyExperiences();
        this.experienceForm.reset();
        this.cdr.markForCheck();
      });
    }
  }

  removeExperience(id: string) {
    this.specialistsRepo.removeExperience(id).subscribe(() => {
      this.profileStore.loadMyExperiences();
      this.cdr.markForCheck();
    });
  }

  // ─── Education ───────────────────────────────────────

  addEducation() {
    if (this.educationForm.valid) {
      const val = this.educationForm.value;
      const request: AddEducationRequest = {
        degree: val.degree,
        institution: val.institution,
        startYear: val.startYear,
        endYear: val.endYear || undefined
      };
      this.userProfileService.addEducation(request).subscribe(() => {
        this.loadEducation();
        this.educationForm.reset({ startYear: new Date().getFullYear() });
        this.cdr.markForCheck();
      });
    }
  }

  removeEducation(id: string) {
    this.userProfileService.deleteEducation(id).subscribe(() => {
      this.loadEducation();
      this.cdr.markForCheck();
    });
  }

  // ─── Social Links ────────────────────────────────────

  addSocialLink() {
    if (this.socialLinkForm.valid) {
      const request: AddSocialLinkRequest = this.socialLinkForm.value;
      this.userProfileService.addSocialLink(request).subscribe(() => {
        this.loadSocialLinks();
        this.socialLinkForm.reset();
        this.cdr.markForCheck();
      });
    }
  }

  removeSocialLink(id: string) {
    this.userProfileService.deleteSocialLink(id).subscribe(() => {
      this.loadSocialLinks();
      this.cdr.markForCheck();
    });
  }

  // ─── Avatar ──────────────────────────────────────────

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreviewUrl = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);

      this.profileImageError = false;
      this.userProfileService.uploadProfileImage(file).subscribe({
        next: (res) => {
          const fileUrl = res.data || res;
          this.avatarPreviewUrl = fileUrl;
          this.authService.updateAvatar(fileUrl);
          this.profileStore.loadMyProfile();
        },
        error: () => {}
      });
    }
  }

  onProfileImageError() {
    this.profileImageError = true;
    this.avatarPreviewUrl = null;
  }

  // ─── Utilities ───────────────────────────────────────

  availablePlatforms = ['LinkedIn', 'Twitter/X', 'Facebook', 'Instagram', 'YouTube', 'GitHub', 'Website', 'Behance', 'Dribbble'];

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}
