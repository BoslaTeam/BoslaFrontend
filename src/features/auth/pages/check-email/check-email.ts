import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-check-email',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './check-email.html',
})
export class CheckEmail {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  email = this.route.snapshot.queryParamMap.get('email') || 'your email';

  readonly resending = signal(false);
  readonly resendSuccess = signal(false);
  readonly resendError = signal('');

  resendLink() {
    this.resending.set(true);
    this.resendSuccess.set(false);
    this.resendError.set('');

    this.authService.resendConfirmationEmail({ email: this.email }).subscribe({
      next: () => {
        this.resending.set(false);
        this.resendSuccess.set(true);
      },
      error: (err) => {
        this.resending.set(false);
        this.resendError.set(
          err.error?.title ?? err.title ?? this.translationService.translate('auth.checkEmail.resendError')
        );
      },
    });
  }
}
