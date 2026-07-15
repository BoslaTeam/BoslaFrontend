import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '@core/services/toast.service';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-file-dispute',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiSpinner],
  templateUrl: './file-dispute.html',
})
export class FileDispute implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);

  readonly paymentId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);

  reason = '';
  description = '';

  ngOnInit(): void {
    if (!this.paymentId) {
      this.router.navigate(['/payments']);
    }
  }

  submitDispute(): void {
    if (!this.reason.trim()) return;

    this.isSubmitting.set(true);
    this.paymentService.fileDispute(this.paymentId, this.reason, this.description || undefined).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
        this.toast.success('تم تقديم الشكوى بنجاح. سيتم مراجعتها من قبل الإدارة.');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.danger(err?.error?.message || 'فشل في تقديم الشكوى.');
      },
    });
  }
}
