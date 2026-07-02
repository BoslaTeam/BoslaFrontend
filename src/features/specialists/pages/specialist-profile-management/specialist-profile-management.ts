import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SpecialistApiService, SpecialistsApiService } from '../../data-access/specialist-api.service';
import { SpecialistProfileResponse } from '../../contracts/specialist-profile-response';
import { UpdateSpecialistRequest } from '../../contracts/specialist-profile-update.contract';
import { LookupResponse } from '../../contracts/lookup.contract';
import { ExperienceResponse } from '../../contracts/specialist-experience.contract';
import { ToastService } from '@core/services/toast.service';
import { UiButton } from '@shared/ui/button/button';
import { UiInput } from '@shared/ui/input/input';
import { UiTextarea } from '@shared/ui/textarea/textarea';
import { Select as UiSelect } from '@shared/ui/select/select';
import { SelectOption } from '@shared/types/select-option.type';

const LEVEL_LABELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'];

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('fromDate')?.value;
  const to = group.get('toDate')?.value;
  if (from && to && to < from) {
    return { dateRange: true };
  }
  return null;
}

@Component({
  selector: 'app-specialist-profile-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, UiButton, UiInput, UiTextarea, UiSelect],
  templateUrl: './specialist-profile-management.html',
})
export class SpecialistProfileManagement implements OnInit {
  private fb = inject(FormBuilder);
  private specialistApi = inject(SpecialistApiService);
  private specialistsApi = inject(SpecialistsApiService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly profile = signal<SpecialistProfileResponse | null>(null);
  readonly experienceLevel = signal(0);
  readonly levelLabel = computed(() => LEVEL_LABELS[this.experienceLevel()]);

  readonly mySkills = signal<LookupResponse[]>([]);
  readonly myTools = signal<LookupResponse[]>([]);
  readonly myExpertise = signal<LookupResponse[]>([]);
  readonly myExperience = signal<ExperienceResponse[]>([]);
  readonly allSkills = signal<LookupResponse[]>([]);
  readonly allTools = signal<LookupResponse[]>([]);
  readonly allExpertise = signal<LookupResponse[]>([]);

  readonly bookingForm = this.fb.nonNullable.group({
    bookingPolicy: ['', Validators.required],
    minBookingNoticeHours: [24, [Validators.required, Validators.min(0)]],
    maxSessionsPerDay: [8, [Validators.required, Validators.min(1)]],
    maxSessionsPerWeek: [40, [Validators.required, Validators.min(1)]],
  });

  readonly cancellationForm = this.fb.nonNullable.group({
    cancellationNoticeHours: [24, [Validators.required, Validators.min(0)]],
    allowCancellation: [true, Validators.required],
    cancellationPolicy: [''],
  });

  readonly profileForm = this.fb.nonNullable.group({
    hourlyRate: [0, [Validators.required, Validators.min(1)]],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    title: [''],
    bio: [''],
    gender: [''],
    preferredLanguage: [''],
    country: [''],
  });

  readonly experienceForm = this.fb.nonNullable.group({
    items: this.fb.array<ReturnType<typeof this.createExperienceGroup>>([]),
  });

  get experienceItems(): FormArray {
    return this.experienceForm.get('items') as FormArray;
  }

  private createExperienceGroup(exp?: ExperienceResponse) {
    return this.fb.nonNullable.group({
      id: [exp?.id || ''],
      jobTitle: [exp?.jobTitle || '', Validators.required],
      companyName: [exp?.companyName || '', Validators.required],
      fromDate: [exp?.fromDate || '', Validators.required],
      toDate: [exp?.toDate || ''],
      description: [exp?.description || ''],
    }, { validators: dateRangeValidator });
  }

  readonly addSkillSearch = signal('');
  readonly addToolSearch = signal('');
  readonly addExpertiseSearch = signal('');
  readonly addSkillOpen = signal(false);
  readonly addToolOpen = signal(false);
  readonly addExpertiseOpen = signal(false);
  readonly savingSkill = signal<string | null>(null);
  readonly savingTool = signal<string | null>(null);
  readonly savingExpertise = signal<string | null>(null);
  readonly editingExperienceId = signal<string | null>(null);

  readonly filteredAddSkills = computed(() => {
    const q = this.addSkillSearch().toLowerCase();
    const currentIds = new Set(this.mySkills().map(s => s.id));
    return this.allSkills().filter(s => !currentIds.has(s.id) && s.name.toLowerCase().includes(q));
  });

  readonly genderOptions: SelectOption[] = [
    { value: 'ذكر', label: 'ذكر' },
    { value: 'أنثى', label: 'أنثى' },
  ];

  readonly languageOptions: SelectOption[] = [
    { value: 'العربية', label: 'العربية' },
    { value: 'English', label: 'English' },
  ];

  readonly countryOptions: SelectOption[] = [
    { value: 'مصر', label: 'مصر' },
    { value: 'السعودية', label: 'السعودية' },
    { value: 'الإمارات', label: 'الإمارات' },
    { value: 'قطر', label: 'قطر' },
    { value: 'الكويت', label: 'الكويت' },
    { value: 'البحرين', label: 'البحرين' },
    { value: 'عمان', label: 'عُمان' },
    { value: 'الأردن', label: 'الأردن' },
    { value: 'العراق', label: 'العراق' },
    { value: 'سوريا', label: 'سوريا' },
    { value: 'لبنان', label: 'لبنان' },
    { value: 'فلسطين', label: 'فلسطين' },
    { value: 'تونس', label: 'تونس' },
    { value: 'الجزائر', label: 'الجزائر' },
    { value: 'المغرب', label: 'المغرب' },
    { value: 'ليبيا', label: 'ليبيا' },
    { value: 'السودان', label: 'السودان' },
    { value: 'اليمن', label: 'اليمن' },
  ];

  readonly filteredAddExpertise = computed(() => {
    const q = this.addExpertiseSearch().toLowerCase();
    const currentIds = new Set(this.myExpertise().map(e => e.id));
    return this.allExpertise().filter(e => !currentIds.has(e.id) && e.name.toLowerCase().includes(q));
  });

  readonly filteredAddTools = computed(() => {
    const q = this.addToolSearch().toLowerCase();
    const currentIds = new Set(this.myTools().map(t => t.id));
    return this.allTools().filter(t => !currentIds.has(t.id) && t.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.specialistApi.getMyProfile().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (res) => {
        const p = res.data;
        this.profile.set(p);
        this.experienceLevel.set(p.experienceLevel);
        this.profileForm.patchValue({
          hourlyRate: p.hourlyRate,
          experienceYears: p.experienceYears,
          title: p.title || '',
          bio: p.bio || '',
          gender: p.gender || '',
          preferredLanguage: p.preferredLanguage || '',
          country: p.country || '',
        });
        this.bookingForm.patchValue({
          bookingPolicy: p.bookingPolicy || '',
          minBookingNoticeHours: p.minBookingNoticeHours,
          maxSessionsPerDay: p.maxSessionsPerDay,
          maxSessionsPerWeek: p.maxSessionsPerWeek,
        });
        this.cancellationForm.patchValue({
          cancellationNoticeHours: p.cancellationDeadlineHours,
          allowCancellation: true,
          cancellationPolicy: '',
        });
      },
      error: () => this.toast.danger('فشل تحميل بيانات الملف الشخصي'),
    });

    this.specialistsApi.getMySkills().subscribe({
      next: (res) => this.mySkills.set(res.data),
    });
    this.specialistsApi.getMyExpertise().subscribe({
      next: (res) => this.myExpertise.set(res.data),
    });
    this.specialistsApi.getMyTools().subscribe({
      next: (res) => this.myTools.set(res.data),
    });
    this.specialistsApi.getMyExperience().subscribe({
      next: (res) => {
        const items = res.data;
        this.myExperience.set(items);
        this.experienceItems.clear();
        items.forEach(e => this.experienceItems.push(this.createExperienceGroup(e)));
      },
    });
    this.specialistsApi.getSkills().subscribe({
      next: (res) => this.allSkills.set(res.data),
    });
    this.specialistsApi.getTools().subscribe({
      next: (res) => this.allTools.set(res.data),
    });
    this.specialistsApi.getExpertise().subscribe({
      next: (res) => this.allExpertise.set(res.data),
    });
  }

  onBookingSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.specialistsApi.updateBookingPolicy(this.bookingForm.getRawValue() as any)
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: () => this.toast.success('تم تحديث سياسة الحجز'),
        error: (err) => this.toast.danger(err.error?.title || 'فشل تحديث سياسة الحجز'),
      });
  }

  onCancellationSubmit(): void {
    if (this.cancellationForm.invalid) {
      this.cancellationForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.specialistsApi.updateCancellationPolicy(this.cancellationForm.getRawValue() as any)
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: () => this.toast.success('تم تحديث سياسة الإلغاء'),
        error: (err) => this.toast.danger(err.error?.title || 'فشل تحديث سياسة الإلغاء'),
      });
  }

  addSkill(skillId: string): void {
    this.savingSkill.set(skillId);
    this.specialistsApi.addSkills({ skillIds: [skillId] }).pipe(
      finalize(() => this.savingSkill.set(null)),
    ).subscribe({
      next: () => {
        const skill = this.allSkills().find(s => s.id === skillId);
        if (skill) this.mySkills.update(list => [...list, skill]);
        this.addSkillOpen.set(false);
        this.addSkillSearch.set('');
        this.toast.success('تم إضافة المهارة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في إضافة المهارة'),
    });
  }

  removeSkill(skillId: string): void {
    this.savingSkill.set(skillId);
    this.specialistsApi.removeSkill(skillId).pipe(
      finalize(() => this.savingSkill.set(null)),
    ).subscribe({
      next: () => {
        this.mySkills.update(list => list.filter(s => s.id !== skillId));
        this.toast.success('تم حذف المهارة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في حذف المهارة'),
    });
  }

  addTool(toolId: string): void {
    this.savingTool.set(toolId);
    this.specialistsApi.addTools({ toolIds: [toolId] }).pipe(
      finalize(() => this.savingTool.set(null)),
    ).subscribe({
      next: () => {
        const tool = this.allTools().find(t => t.id === toolId);
        if (tool) this.myTools.update(list => [...list, tool]);
        this.addToolOpen.set(false);
        this.addToolSearch.set('');
        this.toast.success('تم إضافة الأداة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في إضافة الأداة'),
    });
  }

  addExpertise(expertiseId: string): void {
    this.savingExpertise.set(expertiseId);
    this.specialistsApi.addExpertise(expertiseId).pipe(
      finalize(() => this.savingExpertise.set(null)),
    ).subscribe({
      next: () => {
        const item = this.allExpertise().find(e => e.id === expertiseId);
        if (item) this.myExpertise.update(list => [...list, item]);
        this.addExpertiseOpen.set(false);
        this.addExpertiseSearch.set('');
        this.toast.success('تم إضافة مجال الخبرة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في إضافة مجال الخبرة'),
    });
  }

  removeExpertise(expertiseId: string): void {
    this.savingExpertise.set(expertiseId);
    this.specialistsApi.removeExpertise(expertiseId).pipe(
      finalize(() => this.savingExpertise.set(null)),
    ).subscribe({
      next: () => {
        this.myExpertise.update(list => list.filter(e => e.id !== expertiseId));
        this.toast.success('تم حذف مجال الخبرة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في حذف مجال الخبرة'),
    });
  }

  removeTool(toolId: string): void {
    this.savingTool.set(toolId);
    this.specialistsApi.removeTool(toolId).pipe(
      finalize(() => this.savingTool.set(null)),
    ).subscribe({
      next: () => {
        this.myTools.update(list => list.filter(t => t.id !== toolId));
        this.toast.success('تم حذف الأداة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في حذف الأداة'),
    });
  }

  addExperience(): void {
    this.experienceItems.push(this.createExperienceGroup());
    this.editingExperienceId.set(null);
  }

  removeExperience(index: number): void {
    const group = this.experienceItems.at(index);
    const id = group.get('id')?.value;
    if (!id) {
      this.experienceItems.removeAt(index);
      return;
    }
    this.saving.set(true);
    this.specialistsApi.removeExperience(id).pipe(
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.myExperience.update(list => list.filter(e => e.id !== id));
        this.experienceItems.removeAt(index);
        this.toast.success('تم حذف الخبرة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في حذف الخبرة'),
    });
  }

  saveExperience(index: number): void {
    const group = this.experienceItems.at(index);
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = group.getRawValue();
    const id = raw.id;

    const request = {
      jobTitle: raw.jobTitle,
      companyName: raw.companyName,
      fromDate: raw.fromDate,
      toDate: raw.toDate || null,
      description: raw.description || '',
    };

    const action$ = id
      ? this.specialistsApi.updateExperience(id, request)
      : this.specialistsApi.addExperiences({ experiences: [request] });

    action$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (res: any) => {
        if (!id && res?.data?.[0]) {
          const newId = res.data[0];
          group.patchValue({ id: newId });
          this.myExperience.update(list => [...list, {
            id: newId,
            ...request,
            description: request.description || null,
            toDate: request.toDate,
          }]);
        } else if (id) {
          this.myExperience.update(list =>
            list.map(e => e.id === id ? { ...e, ...request, description: request.description || null } : e)
          );
        }
        this.editingExperienceId.set(null);
        this.toast.success(id ? 'تم تحديث الخبرة' : 'تم إضافة الخبرة');
      },
      error: (err) => this.toast.danger(err.error?.title || 'فشل في حفظ الخبرة'),
    });
  }

  cancelExperienceEdit(): void {
    this.editingExperienceId.set(null);
    this.loadExperience();
  }

  getFieldError(index: number, field: string): string {
    const group = this.experienceItems.at(index);
    const c = group.get(field);
    if (!c || !c.invalid || !c.touched) return '';
    if (c.errors?.['required']) return 'هذا الحقل مطلوب';
    return '';
  }

  getDateError(index: number): string {
    const group = this.experienceItems.at(index);
    if (!group || !group.invalid || !group.touched) return '';
    if (group.errors?.['dateRange']) return 'تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية';
    return '';
  }

  private static computeExperienceLevel(years: number): number {
    if (years <= 2) return 0;
    if (years <= 5) return 1;
    if (years <= 9) return 2;
    return 3;
  }

  onProfileUpdate(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const p = this.profile()!;
    const years = this.profileForm.value.experienceYears ?? p.experienceYears;
    const level = SpecialistProfileManagement.computeExperienceLevel(years);
    const fv = this.profileForm.value;
    const request: UpdateSpecialistRequest = {
      experienceYears: years,
      experienceLevel: level,
      hourlyRate: fv.hourlyRate ?? p.hourlyRate,
      introVideoUrl: p.introVideoUrl ?? null,
      bookingPolicy: p.bookingPolicy ?? null,
      title: fv.title || null,
      bio: fv.bio || null,
      gender: fv.gender || null,
      preferredLanguage: fv.preferredLanguage || null,
      country: fv.country || null,
    };
    this.specialistsApi.updateMyProfile(request)
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: () => {
          this.profile.update(prev => prev ? {
            ...prev,
            hourlyRate: request.hourlyRate,
            experienceYears: years,
            title: request.title || prev.title,
            bio: request.bio || prev.bio,
            gender: request.gender || prev.gender,
            preferredLanguage: request.preferredLanguage || prev.preferredLanguage,
            country: request.country || prev.country,
          } : prev);
          this.experienceLevel.set(level);
          this.toast.success('تم تحديث البيانات');
        },
        error: (err: any) => this.toast.danger(err.error?.title || 'فشل تحديث البيانات'),
      });
  }

  private loadExperience(): void {
    this.specialistsApi.getMyExperience().subscribe({
      next: (res) => {
        const items = res.data;
        this.myExperience.set(items);
        this.experienceItems.clear();
        items.forEach(e => this.experienceItems.push(this.createExperienceGroup(e)));
      },
    });
  }
}
