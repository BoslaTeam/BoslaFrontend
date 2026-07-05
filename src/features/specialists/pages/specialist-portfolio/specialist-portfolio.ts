import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SpecialistsApiService } from '../../data-access/specialist-api.service';
import { PortfolioItemDto, CreatePortfolioItemRequest, UpdatePortfolioItemRequest } from '../../contracts/specialist-portfolio.contract';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-specialist-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './specialist-portfolio.html',
})
export class SpecialistPortfolio implements OnInit {
  private api = inject(SpecialistsApiService);
  private toast = inject(ToastService);

  readonly items = signal<PortfolioItemDto[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly editId = signal<string | null>(null);

  // Form fields
  formTitle = '';
  formDescription = '';
  formCoverImageUrl = '';
  formWorkUrl = '';
  formImageUrls: string[] = [];
  formCoverImageUploading = false;
  formImagesUploading = false;

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.api.getMyPortfolio().subscribe({
      next: (res) => {
        this.items.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.danger('فشل تحميل معرض الأعمال');
      },
    });
  }

  openAddForm() {
    this.resetForm();
    this.editId.set(null);
    this.showForm.set(true);
  }

  openEditForm(item: PortfolioItemDto) {
    this.formTitle = item.title;
    this.formDescription = item.description || '';
    this.formCoverImageUrl = item.coverImageUrl;
    this.formWorkUrl = item.workUrl || '';
    this.formImageUrls = item.images.map(i => i.imageUrl);
    this.editId.set(item.id);
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.resetForm();
  }

  private resetForm() {
    this.formTitle = '';
    this.formDescription = '';
    this.formCoverImageUrl = '';
    this.formWorkUrl = '';
    this.formImageUrls = [];
    this.editId.set(null);
  }

  onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.formCoverImageUploading = true;
    this.api.uploadPortfolioImage(input.files[0]).subscribe({
      next: (res) => {
        this.formCoverImageUrl = res.data!;
        this.formCoverImageUploading = false;
      },
      error: () => {
        this.toast.danger('فشل رفع الصورة');
        this.formCoverImageUploading = false;
      },
    });
    input.value = '';
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.formImagesUploading = true;
    const files = Array.from(input.files);
    let completed = 0;
    for (const file of files) {
      this.api.uploadPortfolioImage(file).subscribe({
        next: (res) => {
          this.formImageUrls.push(res.data!);
          completed++;
          if (completed === files.length) this.formImagesUploading = false;
        },
        error: () => {
          completed++;
          if (completed === files.length) this.formImagesUploading = false;
          this.toast.danger('فشل رفع إحدى الصور');
        },
      });
    }
    input.value = '';
  }

  removeImage(url: string) {
    this.formImageUrls = this.formImageUrls.filter(u => u !== url);
  }

  submitForm() {
    if (!this.formTitle.trim()) {
      this.toast.warning('يرجى إدخال عنوان العمل');
      return;
    }
    if (!this.formCoverImageUrl) {
      this.toast.warning('يرجى رفع الصورة الرئيسية');
      return;
    }
    this.saving.set(true);

    if (this.editId()) {
      const request: UpdatePortfolioItemRequest = {
        title: this.formTitle.trim(),
        description: this.formDescription.trim() || undefined,
        coverImageUrl: this.formCoverImageUrl,
        imageUrls: this.formImageUrls,
        workUrl: this.formWorkUrl.trim() || undefined,
      };
      this.api.updatePortfolioItem(this.editId()!, request).subscribe({
        next: () => {
          this.toast.success('تم تحديث العمل');
          this.showForm.set(false);
          this.resetForm();
          this.load();
          this.saving.set(false);
        },
        error: () => {
          this.toast.danger('فشل تحديث العمل');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreatePortfolioItemRequest = {
        title: this.formTitle.trim(),
        description: this.formDescription.trim() || undefined,
        coverImageUrl: this.formCoverImageUrl,
        imageUrls: this.formImageUrls,
        workUrl: this.formWorkUrl.trim() || undefined,
      };
      this.api.createPortfolioItem(request).subscribe({
        next: () => {
          this.toast.success('تم إضافة العمل. بانتظار مراجعة الإدارة.');
          this.showForm.set(false);
          this.resetForm();
          this.load();
          this.saving.set(false);
        },
        error: () => {
          this.toast.danger('فشل إضافة العمل');
          this.saving.set(false);
        },
      });
    }
  }

  deleteItem(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
    this.api.deletePortfolioItem(id).subscribe({
      next: () => {
        this.toast.success('تم حذف العمل');
        this.load();
      },
      error: () => this.toast.danger('فشل حذف العمل'),
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Approved': return 'مقبول';
      case 'Rejected': return 'مرفوض';
      case 'Pending': return 'قيد المراجعة';
      default: return 'مسودة';
    }
  }
}
