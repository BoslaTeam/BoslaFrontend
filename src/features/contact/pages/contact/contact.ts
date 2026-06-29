import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.html',
})
export class ContactPage {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private toast = inject(ToastService);

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
        this.toast.success('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.');
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.toast.danger('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
        this.isSubmitting = false;
      },
    });
  }
}
