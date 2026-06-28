import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistsRepository } from '../../data-access/specialist.repository';
import { LookupItem } from '../../models/lookup.model';
import { Experience } from '../../models/experience.model';

@Component({
  selector: 'app-specialist-professional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specialist-professional.html',
})
export class SpecialistProfessional implements OnInit {
  private readonly repository = inject(SpecialistsRepository);
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
    this.repository.getMySkills().subscribe({
      next: (data) => this.skills.set(data),
    });
  }

  private loadTools() {
    this.repository.getMyTools().subscribe({
      next: (data) => this.tools.set(data),
    });
  }

  private loadExperiences() {
    this.repository.getMyExperience().subscribe({
      next: (data) => this.experiences.set(data),
    });
  }

  private loadAvailableSkills() {
    this.repository.getSkills().subscribe({
      next: (data) => this.availableSkills.set(data),
    });
  }

  private loadAvailableTools() {
    this.repository.getTools().subscribe({
      next: (data) => this.availableTools.set(data),
    });
  }

  addSkill() {
    if (this.skillForm.valid) {
      const skillId = this.skillForm.value.skillId;
      this.repository.addSkills([skillId]).subscribe(() => {
        this.loadSkills();
        this.skillForm.reset();
      });
    }
  }

  removeSkill(skillId: string) {
    this.repository.removeSkill(skillId).subscribe(() => {
      this.loadSkills();
    });
  }

  addTool() {
    if (this.toolForm.valid) {
      const toolId = this.toolForm.value.toolId;
      this.repository.addTools([toolId]).subscribe(() => {
        this.loadTools();
        this.toolForm.reset();
      });
    }
  }

  removeTool(toolId: string) {
    this.repository.removeTool(toolId).subscribe(() => {
      this.loadTools();
    });
  }

  addExperience() {
    if (this.experienceForm.valid) {
      this.repository.addExperiences([this.experienceForm.value]).subscribe(() => {
        this.loadExperiences();
        this.experienceForm.reset();
      });
    }
  }

  removeExperience(id: string) {
    this.repository.removeExperience(id).subscribe(() => {
      this.loadExperiences();
    });
  }
}
