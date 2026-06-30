import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuditLogDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';

interface ActionOption {
  value: string | null;
  label: string;
}

@Component({
  selector: 'app-admin-audit-logs',
  imports: [DatePipe, SlicePipe, FormsModule],
  templateUrl: './admin-audit-logs.html',
  styleUrl: './admin-audit-logs.css',
})
export class AdminAuditLogs implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly logs = signal<AuditLogDto[]>([]);
  readonly isLoading = signal(true);
  readonly metadata = signal<PaginationMetadata | null>(null);
  readonly selectedLog = signal<AuditLogDto | null>(null);
  readonly showDetail = signal(false);

  searchQuery = '';
  selectedAction: string | null = null;
  entityTypeFilter = '';
  dateFrom = '';
  dateTo = '';
  currentPage = 1;
  pageSize = 15;

  readonly totalLogs = computed(() => this.metadata()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.metadata()?.totalPages ?? 0);
  readonly hasActiveFilters = computed(() =>
    !!this.searchQuery || !!this.selectedAction || !!this.entityTypeFilter || !!this.dateFrom || !!this.dateTo
  );

  readonly actionOptions: ActionOption[] = [
    { value: null, label: 'كل الإجراءات' },
    { value: 'Created', label: 'إنشاء' },
    { value: 'Updated', label: 'تحديث' },
    { value: 'Verified', label: 'تحقق' },
    { value: 'Deleted', label: 'حذف' },
  ];

  readonly entityTypeOptions: ActionOption[] = [
    { value: null, label: 'كل الكيانات' },
    { value: 'User', label: 'مستخدم' },
    { value: 'Specialist', label: 'مختص' },
    { value: 'Appointment', label: 'حجز' },
    { value: 'Payment', label: 'دفع' },
    { value: 'Expertise', label: 'مجال خبرة' },
    { value: 'Skill', label: 'مهارة' },
    { value: 'Tool', label: 'أداة' },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);

    this.adminService.getAuditLogs({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      action: this.selectedAction ?? undefined,
      entityType: this.entityTypeFilter || undefined,
      from: this.dateFrom || undefined,
      to: this.dateTo || undefined,
    }).subscribe({
      next: (res) => {
        if (res.data) {
          this.logs.set(res.data.items);
          this.metadata.set(res.data.metadata);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedAction = null;
    this.entityTypeFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadLogs();
  }

  viewDetail(log: AuditLogDto): void {
    this.selectedLog.set(log);
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
  }

  getActionClass(action: string): string {
    const classes: Record<string, string> = {
      Created: 'action-created',
      Updated: 'action-updated',
      Verified: 'action-verified',
      Deleted: 'action-deleted',
    };
    return classes[action] ?? '';
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      Created: 'plus',
      Updated: 'edit',
      Verified: 'check',
      Deleted: 'x',
    };
    return icons[action] ?? 'circle';
  }

  getEntityLabel(type: string): string {
    const labels: Record<string, string> = {
      User: 'مستخدم',
      Specialist: 'مختص',
      Appointment: 'حجز',
      Payment: 'دفع',
      Expertise: 'مجال خبرة',
      Skill: 'مهارة',
      Tool: 'أداة',
    };
    return labels[type] ?? type;
  }

  getEntityBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      User: 'entity-user',
      Specialist: 'entity-specialist',
      Appointment: 'entity-appointment',
      Payment: 'entity-payment',
    };
    return classes[type] ?? 'entity-default';
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.substring(0, 2).toUpperCase();
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
}
