import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminUserDto } from '../../contracts/admin.contracts';
import { PaginationMetadata } from '@core/models/paginated-response.model';
import { DEFAULT_PAGINATION_REQUEST } from '@core/models/pagination.model';
import { UserRole } from '@core/enums/user-role.enum';

@Component({
  selector: 'app-admin-users-list',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css',
})
export class AdminUsersList implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly users = signal<AdminUserDto[]>([]);
  readonly isLoading = signal(true);
  readonly metadata = signal<PaginationMetadata | null>(null);

  // Filters
  searchQuery = '';
  selectedRole: number | undefined = undefined;
  selectedStatus: boolean | undefined = undefined;
  currentPage = 1;
  pageSize = 10;

  readonly totalUsers = computed(() => this.metadata()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.metadata()?.totalPages ?? 0);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.adminService
      .getUsers({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchQuery || undefined,
        role: this.selectedRole,
        isActive: this.selectedStatus,
      })
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.users.set(res.data.items);
            this.metadata.set(res.data.metadata);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.users.set([]);
          this.isLoading.set(false);
        },
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterRole(role: string): void {
    this.selectedRole = role === '' ? undefined : parseInt(role, 10);
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterStatus(status: string): void {
    this.selectedStatus = status === '' ? undefined : status === 'true';
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadUsers();
  }

  toggleUserStatus(user: AdminUserDto): void {
    const action$ = user.isActive
      ? this.adminService.deactivateUser(user.id)
      : this.adminService.reactivateUser(user.id);

    action$.subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }

  getRoleName(role: number): string {
    const names: Record<number, string> = {
      0: 'مستخدم',
      1: 'متخصص',
      2: 'مدير',
    };
    return names[role] ?? 'غير معروف';
  }

  getRoleClass(role: number): string {
    const classes: Record<number, string> = {
      0: 'role-user',
      1: 'role-specialist',
      2: 'role-admin',
    };
    return classes[role] ?? 'role-user';
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

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
