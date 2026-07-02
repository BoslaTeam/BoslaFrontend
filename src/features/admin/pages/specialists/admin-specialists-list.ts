import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../services/admin.service';
import { AdminSpecialistListItemDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';

@Component({
  selector: 'app-admin-specialists-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-specialists-list.html',
  styleUrl: './admin-specialists-list.css',
})
export class AdminSpecialistsList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  readonly specialists = signal<AdminSpecialistListItemDto[]>([]);
  readonly isLoading = signal(true);
  readonly metadata = signal<PaginationMetadata | null>(null);

  searchQuery = '';
  selectedTab: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  currentPage = 1;
  pageSize = 10;

  readonly totalSpecialists = computed(() => this.metadata()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.metadata()?.totalPages ?? 0);

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'pending') this.selectedTab = 'pending';
      else if (fragment === 'approved') this.selectedTab = 'approved';
      else if (fragment === 'rejected') this.selectedTab = 'rejected';
      this.loadSpecialists();
    });
  }

  loadSpecialists(): void {
    this.isLoading.set(true);

    const verificationStatus = this.selectedTab === 'all' ? undefined : this.selectedTab;

    this.adminService.getAllSpecialists({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      verificationStatus,
    }).subscribe({
      next: (res) => {
        if (res.data) {
          this.specialists.set(res.data.items);
          this.metadata.set(res.data.metadata);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.specialists.set([]);
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.selectedTab = tab;
    this.currentPage = 1;
    this.loadSpecialists();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadSpecialists();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadSpecialists();
  }

  verifySpecialist(id: string, isApproved: boolean): void {
    this.adminService.verifySpecialist(id, { isVerified: isApproved }).subscribe({
      next: () => this.loadSpecialists(),
    });
  }

  getVerificationStatusLabel(status: string): string {
    const labels: Record<string, string> = { Pending: 'معلق', Approved: 'مقبول', Rejected: 'مرفوض' };
    return labels[status] ?? status;
  }

  getVerificationStatusClass(status: string): string {
    const classes: Record<string, string> = { Pending: 'status-pending', Approved: 'status-approved', Rejected: 'status-rejected' };
    return classes[status] ?? 'status-pending';
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
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
