import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminPaymentDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';

type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

interface StatusOption {
  value: PaymentStatus | null;
  label: string;
}

@Component({
  selector: 'app-admin-payments-list',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './admin-payments-list.html',
  styleUrl: './admin-payments-list.css',
})
export class AdminPaymentsList implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly payments = signal<AdminPaymentDto[]>([]);
  readonly isLoading = signal(true);
  readonly metadata = signal<PaginationMetadata | null>(null);

  searchQuery = '';
  selectedStatus: string | null = null;
  currentPage = 1;
  pageSize = 10;

  readonly totalPayments = computed(() => this.metadata()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.metadata()?.totalPages ?? 0);

  readonly statusOptions: StatusOption[] = [
    { value: null, label: 'الكل' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'Pending', label: 'قيد الانتظار' },
    { value: 'Failed', label: 'فشل' },
    { value: 'Refunded', label: 'مسترجع' },
  ];

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);

    this.adminService.getPayments({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      status: this.selectedStatus ?? undefined,
    }).subscribe({
      next: (res) => {
        if (res.data) {
          this.payments.set(res.data.items);
          this.metadata.set(res.data.metadata);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadPayments();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPayments();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadPayments();
  }

  getStatusLabel(status: string): string {
    return this.statusOptions.find((o) => o.value === status)?.label ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Completed: 'status-completed',
      Pending: 'status-pending',
      Failed: 'status-failed',
      Refunded: 'status-refunded',
    };
    return classes[status] ?? 'status-pending';
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      stripe: 'Stripe',
      card: 'بطاقة ائتمان',
      wallet: 'محفظة',
      bank: 'تحويل بنكي',
    };
    return labels[method.toLowerCase()] ?? method;
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.substring(0, 2).toUpperCase();
  }
}
