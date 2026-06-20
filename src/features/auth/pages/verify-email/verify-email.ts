import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html'
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  isVerifying = true;
  isSuccess = false;
  message = 'Verifying your email...';

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (email && token) {
      this.authService.confirmEmail({ email, token }).subscribe({
        next: () => {
          this.isSuccess = true;
          this.message = 'Email verified successfully! You can now sign in.';
          this.isVerifying = false;
        },
        error: (err) => {
          this.isSuccess = false;
          this.message = err.error?.title || 'Verification failed. The link might be expired or invalid.';
          this.isVerifying = false;
        }
      });
    } else {
      this.isVerifying = false;
      this.isSuccess = false;
      this.message = 'Invalid verification link.';
    }
  }
}
