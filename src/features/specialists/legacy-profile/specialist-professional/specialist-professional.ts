import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistListRepository } from '../../data-access/specialist-list.repository';
import { SpecialistOnboardingRepository } from '../../data-access/specialist-onboarding.repository';
import { LookupItem } from '../../models/lookup.model';
import { Experience } from '../../models/experience.model';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-specialist-professional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './specialist-professional.html',
})
export class SpecialistProfessional implements OnInit {
  private readonly listRepo = inject(SpecialistListRepository);
  private readonly onboardingRepo = inject(SpecialistOnboardingRepository);
  private fb = inject(FormBuilder);

  readonly skills = signal<LookupItem[]>([]);
  readonly tools = signal<LookupItem[]>([]);
  readonly availableSkills = signal<LookupItem[]>([]);
  readonly availableTools = signal<LookupItem[]>([]);
  readonly experiences = signal<Experience[]>([]);
  readonly loading = signal(false);

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
  }

  ngOnInit() {
    this.loadSkills();
    this.loadTools();
    this.loadExperiences();
    this.loadAvailableSkills();
    this.loadAvailableTools();
  }

  private loadSkills() {
    this.onboardingRepo.getMySkills().subscribe({
      next: (data) => this.skills.set(data),
    });
  }

  private loadTools() {
    this.onboardingRepo.getMyTools().subscribe({
      next: (data) => this.tools.set(data),
    });
  }

  private loadExperiences() {
    this.onboardingRepo.getMyExperience().subscribe({
      next: (data) => this.experiences.set(data),
    });
  }

  private loadAvailableSkills() {
    this.listRepo.getSkills().subscribe({
      next: (data) => this.availableSkills.set(data),
    });
  }

  private loadAvailableTools() {
    this.listRepo.getTools().subscribe({
      next: (data) => this.availableTools.set(data),
    });
  }

  addSkill() {
    if (this.skillForm.valid) {
      const skillId = this.skillForm.value.skillId;
      this.onboardingRepo.addSkills([skillId]).subscribe(() => {
        this.loadSkills();
        this.skillForm.reset();
      });
    }
  }

  removeSkill(skillId: string) {
    this.onboardingRepo.removeSkill(skillId).subscribe(() => {
      this.loadSkills();
    });
  }

  addTool() {
    if (this.toolForm.valid) {
      const toolId = this.toolForm.value.toolId;
      this.onboardingRepo.addTools([toolId]).subscribe(() => {
        this.loadTools();
        this.toolForm.reset();
      });
    }
  }

  removeTool(toolId: string) {
    this.onboardingRepo.removeTool(toolId).subscribe(() => {
      this.loadTools();
    });
  }

  addExperience() {
    if (this.experienceForm.valid) {
      this.onboardingRepo.addExperiences([this.experienceForm.value]).subscribe(() => {
        this.loadExperiences();
        this.experienceForm.reset();
      });
    }
  }

  removeExperience(id: string) {
    this.onboardingRepo.removeExperience(id).subscribe(() => {
      this.loadExperiences();
    });
  }
}
