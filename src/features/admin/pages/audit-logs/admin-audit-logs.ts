import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TranslationService } from '@core/services/translation.service';
import { AuditLogDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
interface ActionOption {
  value: string | null;
  label: string;
}

@Component({
  selector: 'app-admin-audit-logs',
  imports: [DatePipe, SlicePipe, FormsModule, TranslatePipe],
  templateUrl: './admin-audit-logs.html',
  styleUrl: './admin-audit-logs.css',
})
export class AdminAuditLogs implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

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

  get actionOptions(): ActionOption[] {
    return [
      { value: null, label: this.translationService.translate('admin.audit.action.all') },
      { value: 'Created', label: this.translationService.translate('admin.audit.action.Created') },
      { value: 'Updated', label: this.translationService.translate('admin.audit.action.Updated') },
      { value: 'Verified', label: this.translationService.translate('admin.audit.action.Verified') },
      { value: 'Deleted', label: this.translationService.translate('admin.audit.action.Deleted') },
    ];
  }

  get entityTypeOptions(): ActionOption[] {
    return [
      { value: null, label: this.translationService.translate('admin.audit.entity.all') },
      { value: 'User', label: this.translationService.translate('admin.audit.entity.User') },
      { value: 'Specialist', label: this.translationService.translate('admin.audit.entity.Specialist') },
      { value: 'Appointment', label: this.translationService.translate('admin.audit.entity.Appointment') },
      { value: 'Payment', label: this.translationService.translate('admin.audit.entity.Payment') },
      { value: 'Expertise', label: this.translationService.translate('admin.audit.entity.Expertise') },
      { value: 'Skill', label: this.translationService.translate('admin.audit.entity.Skill') },
      { value: 'Tool', label: this.translationService.translate('admin.audit.entity.Tool') },
    ];
  }

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
      User: this.translationService.translate('admin.audit.entity.User'),
      Specialist: this.translationService.translate('admin.audit.entity.Specialist'),
      Appointment: this.translationService.translate('admin.audit.entity.Appointment'),
      Payment: this.translationService.translate('admin.audit.entity.Payment'),
      Expertise: this.translationService.translate('admin.audit.entity.Expertise'),
      Skill: this.translationService.translate('admin.audit.entity.Skill'),
      Tool: this.translationService.translate('admin.audit.entity.Tool'),
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
