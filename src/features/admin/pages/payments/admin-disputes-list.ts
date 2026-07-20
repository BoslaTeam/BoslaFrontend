import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ComplaintListItemDto } from '@features/payments/contracts/payment.contracts';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-disputes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './admin-disputes-list.html',
})
export class AdminDisputesList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

  readonly disputes = signal<ComplaintListItemDto[]>([]);
  readonly isLoading = signal(true);
  readonly activeTab = signal<'all' | 'Pending' | 'Resolved'>('all');

  ngOnInit(): void {
    this.loadDisputes();
  }

  loadDisputes(): void {
    this.isLoading.set(true);
    const status = this.activeTab() === 'all' ? undefined : this.activeTab();
    this.adminService.getAllDisputes(status).subscribe({
      next: (data) => {
        this.disputes.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setTab(tab: 'all' | 'Pending' | 'Resolved'): void {
    this.activeTab.set(tab);
    this.loadDisputes();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: this.translationService.translate('dispute.status.Pending'),
      Reviewed: this.translationService.translate('dispute.status.Reviewed'),
      ResolvedRefunded: this.translationService.translate('dispute.status.ResolvedRefunded'),
      ResolvedRejected: this.translationService.translate('dispute.status.ResolvedRejected'),
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'bg-amber-50 text-amber-600 border-amber-200',
      Reviewed: 'bg-blue-50 text-blue-600 border-blue-200',
      ResolvedRefunded: 'bg-red-50 text-red-600 border-red-200',
      ResolvedRejected: 'bg-green-50 text-green-600 border-green-200',
    };
    return classes[status] ?? 'bg-slate-50';
  }
}
