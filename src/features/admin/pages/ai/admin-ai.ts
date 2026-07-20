import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { TranslationService } from '@core/services/translation.service';
import { EmbeddingsStatusDto } from '../../contracts/admin.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-ai',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './admin-ai.html',
  styleUrl: './admin-ai.css',
})
export class AdminAi implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

  readonly status = signal<EmbeddingsStatusDto | null>(null);
  readonly isLoading = signal(true);
  readonly isRebuilding = signal(false);

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading.set(true);
    this.adminService.getEmbeddingsStatus().subscribe({
      next: (data) => {
        this.status.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  rebuild(): void {
    if (this.isRebuilding()) return;
    this.isRebuilding.set(true);
    this.adminService.rebuildEmbeddings().subscribe({
      next: () => {
        this.isRebuilding.set(false);
        this.loadStatus();
      },
      error: () => this.isRebuilding.set(false),
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      up_to_date: this.translationService.translate('admin.ai.status.up_to_date'),
      outdated: this.translationService.translate('admin.ai.status.outdated'),
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = { up_to_date: 'status-ok', outdated: 'status-warn' };
    return classes[status] ?? 'status-ok';
  }
}
