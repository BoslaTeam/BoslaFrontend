import { Component, inject, OnInit, output, signal } from '@angular/core';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { SpecialistDocumentResponse, SpecialistDocumentType } from '../../../contracts/specialist-document.contract';
import { UiButton } from '@shared/ui/button/button';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'documents-step',
  standalone: true,
  imports: [UiButton, TranslatePipe],
  templateUrl: './documents-step.html',
})
export class DocumentsStep implements OnInit {
  readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly translationService = inject(TranslationService);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isUploading = signal(false);
  readonly isDeleting = signal<Record<string, boolean>>({});
  readonly errorMessage = signal('');
  readonly acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

  ngOnInit() {
    this.onboardingStore.loadDocuments().subscribe();
  }

  get documents(): SpecialistDocumentResponse[] {
    return this.onboardingStore.draft().documents;
  }

  identityDocs(): SpecialistDocumentResponse[] {
    return this.documents.filter(d => d.type === SpecialistDocumentType.Identity);
  }

  certificateDocs(): SpecialistDocumentResponse[] {
    return this.documents.filter(d => d.type === SpecialistDocumentType.Certificate);
  }

  onFileSelected(event: Event, type: SpecialistDocumentType) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    this.errorMessage.set('');

    this.onboardingStore.uploadDocument(file, type).subscribe({
      next: () => {
        this.isUploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(
          (err.error ?? err)?.title ?? this.translationService.translate('onboarding.documents.errorUpload')
        );
        input.value = '';
      },
    });
  }

  deleteDocument(doc: SpecialistDocumentResponse) {
    this.isDeleting.update(d => ({ ...d, [doc.id]: true }));
    this.errorMessage.set('');

    this.onboardingStore.deleteDocument(doc.id).subscribe({
      next: () => this.isDeleting.update(d => ({ ...d, [doc.id]: false })),
      error: (err) => {
        this.isDeleting.update(d => ({ ...d, [doc.id]: false }));
        this.errorMessage.set(
          (err.error ?? err)?.title ?? this.translationService.translate('onboarding.documents.errorDelete')
        );
      },
    });
  }

  onNext() {
    this.completed.emit();
  }
}
