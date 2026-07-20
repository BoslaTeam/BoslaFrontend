import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './verify-email.html',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);

  isVerifying = true;
  isSuccess = false;
  message = '';

  ngOnInit() {
    this.message = this.translationService.translate('auth.verifyEmail.verifying');
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (email && token) {
      this.authService.confirmEmail({ email, token }).subscribe({
        next: () => {
          this.isSuccess = true;
          this.message = this.translationService.translate('auth.verifyEmail.success');
          this.isVerifying = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSuccess = false;
          const body = err.error;
          if (body?.title) {
            this.message = body.title;
          } else if (body?.errors) {
            const msgs = Object.values(body.errors).flat() as string[];
            this.message = msgs.join(' • ');
          } else {
            this.message = this.translationService.translate('auth.verifyEmail.invalidLink');
          }
          this.isVerifying = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.isVerifying = false;
      this.isSuccess = false;
      this.message = this.translationService.translate('auth.verifyEmail.invalidLink');
      this.cdr.markForCheck();
    }
  }
}
