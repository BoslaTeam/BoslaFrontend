import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '@core/services/toast.service';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.html',
})
export class ContactPage {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private toast = inject(ToastService);
  private translationService = inject(TranslationService);

  contactForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) return;
    this.isSubmitting = true;
    this.contactService.sendMessage(this.contactForm.value).subscribe({
      next: () => {
        this.toast.success(this.translationService.translate('contact.success'));
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.toast.danger(this.translationService.translate('contact.error'));
        this.isSubmitting = false;
      },
    });
  }
}
