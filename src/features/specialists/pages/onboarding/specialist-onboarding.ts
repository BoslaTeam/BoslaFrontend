import { Component, OnInit, inject } from '@angular/core';
import { SpecialistsStore } from '../../store/specialists.store';
import { SpecialistOnboardingStore } from '../../store/specialist-onboarding.store';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { OnboardingStepper } from '../../components/onboarding/onboarding-stepper/onboarding-stepper';
import { BasicInfoStep } from '../../components/onboarding/basic-info-step/basic-info-step';
import { SkillsStep } from '../../components/onboarding/skills-step/skills-step';
import { ToolsStep } from '../../components/onboarding/tools-step/tools-step';
import { ExperienceStep } from '../../components/onboarding/experience-step/experience-step';
import { AvailabilityStep } from '../../components/onboarding/availability-step/availability-step';

@Component({
  selector: 'app-specialist-onboarding',
  standalone: true,
  imports: [
    OnboardingStepper,
    BasicInfoStep,
    SkillsStep,
    ToolsStep,
    ExperienceStep,
    AvailabilityStep,
  ],
  templateUrl: './specialist-onboarding.html',
})
export class SpecialistOnboardingPage implements OnInit {
  private readonly specialistsStore = inject(SpecialistsStore);
  readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);

  readonly stepTitles = [
    'المعلومات الأساسية',
    'المهارات',
    'الأدوات',
    'الخبرات',
    'المواعيد',
  ];

  ngOnInit() {
    this.specialistsStore.loadLookups();
    this.onboardingStore.reset();
  }

  onAvailabilityCompleted() {
    this.onboardingStore.clearDraft();
    this.navigationService.redirectAfterLogin();
  }
}