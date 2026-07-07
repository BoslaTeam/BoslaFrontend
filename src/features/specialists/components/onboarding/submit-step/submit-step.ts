import { Component, inject, output, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiButton } from '@shared/ui/button/button';

@Component({
  selector: 'submit-step',
  standalone: true,
  imports: [UiButton],
  templateUrl: './submit-step.html',
})
export class SubmitStep {
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);
  readonly onboardingStore = inject(SpecialistOnboardingStore);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly back = output<void>();

  get draft() {
    return this.onboardingStore.draft();
  }

  get status() {
    return this.authService.specialistStatus();
  }

  get hasBasicInfo() {
    return this.draft.basicInfo !== null;
  }

  get hasSkills() {
    return this.draft.skills.length > 0;
  }

  get hasTools() {
    return this.draft.tools.length > 0;
  }

  get hasExperiences() {
    return this.draft.experiences.length > 0;
  }

  get hasAvailabilities() {
    return this.draft.availabilities.length > 0;
  }

  get hasDocuments() {
    return this.draft.documents.length > 0;
  }

  onSubmit() {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.onboardingStore.submitForReview().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.navigationService.redirectAfterLogin();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const apiError = err.error ?? err;
        if (apiError?.errors) {
          const msgs = Object.values(apiError.errors).flat() as string[];
          this.errorMessage.set(msgs.join(' • '));
        } else {
          this.errorMessage.set(
            apiError?.title ?? 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.'
          );
        }
      },
    });
  }
}
