import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-profile-social',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile-social.html',
})
export class ProfileSocial {
  readonly profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  readonly socialLinks = this.profileStore.socialLinks;

  socialLinkForm: FormGroup;

  constructor() {
    this.socialLinkForm = this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  addSocialLink() {
    if (this.socialLinkForm.valid) {
      this.profileStore.addSocialLink(this.socialLinkForm.value);
      this.socialLinkForm.reset();
    }
  }

  deleteSocialLink(id: string) {
    this.profileStore.deleteSocialLink(id);
  }
}
