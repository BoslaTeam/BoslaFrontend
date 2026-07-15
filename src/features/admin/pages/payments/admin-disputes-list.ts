import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ComplaintDto } from '@features/payments/contracts/payment.contracts';

@Component({
  selector: 'app-admin-disputes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-disputes-list.html',
})
export class AdminDisputesList implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly disputes = signal<ComplaintDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadDisputes();
  }

  loadDisputes(): void {
    this.isLoading.set(true);
    this.adminService.getPendingDisputes().subscribe({
      next: (res) => {
        this.disputes.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Reviewed: 'تمت المراجعة',
      ResolvedRefunded: 'تم الرد (استرجاع)',
      ResolvedRejected: 'تم الرد (رفض)',
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
