import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { SpecialistProfileStore } from '../../../../specialists/store/specialist-profile.store';
import { SpecialistsRepository } from '../../../../specialists/data-access/specialist.repository';
import { LookupItem } from '../../../../specialists/models/lookup.model';

@Component({
  selector: 'app-specialist-professional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specialist-professional.html',
})
export class SpecialistProfessional implements OnInit {
  readonly profileStore = inject(SpecialistProfileStore);
  private specialistsRepo = inject(SpecialistsRepository);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  availableSkills = signal<LookupItem[]>([]);
  availableTools = signal<LookupItem[]>([]);

  skillForm: FormGroup;
  toolForm: FormGroup;
  experienceForm: FormGroup;

  constructor() {
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

    merge(
      this.experienceForm.statusChanges,
      this.experienceForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    this.profileStore.loadMyData();
    this.loadLookups();
  }

  private loadLookups() {
    this.specialistsRepo.getSkills().subscribe(data => this.availableSkills.set(data));
    this.specialistsRepo.getTools().subscribe(data => this.availableTools.set(data));
  }

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
}
