import { Component, OnInit, inject, computed } from '@angular/core';
import { SpecialistsStore } from '../../store/specialists.store';
import { SpecialistOnboardingStore } from '../../store/specialist-onboarding.store';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { OnboardingStepper } from '../../components/onboarding/onboarding-stepper/onboarding-stepper';
import { BasicInfoStep } from '../../components/onboarding/basic-info-step/basic-info-step';
import { SkillsStep } from '../../components/onboarding/skills-step/skills-step';
import { ToolsStep } from '../../components/onboarding/tools-step/tools-step';
import { ExperienceStep } from '../../components/onboarding/experience-step/experience-step';
import { AvailabilityStep } from '../../components/onboarding/availability-step/availability-step';
import { DocumentsStep } from '../../components/onboarding/documents-step/documents-step';
import { SubmitStep } from '../../components/onboarding/submit-step/submit-step';

@Component({
  selector: 'app-specialist-onboarding',
  standalone: true,
  imports: [OnboardingStepper, BasicInfoStep, SkillsStep, ToolsStep, ExperienceStep, AvailabilityStep, DocumentsStep, SubmitStep, TranslatePipe],
  templateUrl: './specialist-onboarding.html',
})
export class SpecialistOnboardingPage implements OnInit {
  private readonly specialistsStore = inject(SpecialistsStore);
  readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  readonly stepTitles = [
    'onboarding.step.documents',
    'onboarding.step.experience',
    'onboarding.step.basicInfo',
    'onboarding.step.skills',
    'onboarding.step.tools',
    'onboarding.step.availability',
    'onboarding.step.review',
  ];

  readonly stepTitleLabels = computed(() =>
    this.stepTitles.map(key => this.translationService.translate(key))
  );

  readonly stepIcons = [
    'fa-regular fa-id-card',
    'fa-solid fa-briefcase',
    'fa-solid fa-star',
    'fa-regular fa-lightbulb',
    'fa-solid fa-screwdriver-wrench',
    'fa-regular fa-calendar-days',
    'fa-solid fa-paper-plane',
  ];

  ngOnInit() {
    this.specialistsStore.loadLookups();
    this.onboardingStore.reset();
    this.onboardingStore.initDraft().subscribe();
  }

  onAvailabilityCompleted() {
    this.onboardingStore.nextStep();
  }
}