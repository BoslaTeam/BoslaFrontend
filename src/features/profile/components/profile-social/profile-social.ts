import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../../users/services/user-profile.service';
import { SocialLinkDto } from '../../../users/contracts/user.contracts';

@Component({
  selector: 'app-profile-social',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-social.html',
})
export class ProfileSocial implements OnInit {
  private userProfileService = inject(UserProfileService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  socialLinks: SocialLinkDto[] = [];
  socialLinkForm: FormGroup;

  constructor() {
    this.socialLinkForm = this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  ngOnInit() {
    this.loadSocialLinks();
  }

  loadSocialLinks() {
    this.userProfileService.getSocialLinks().subscribe(res => {
      this.socialLinks = res;
      this.cdr.markForCheck();
    });
  }

  addSocialLink() {
    if (this.socialLinkForm.valid) {
      this.userProfileService.addSocialLink(this.socialLinkForm.value).subscribe(() => {
        this.loadSocialLinks();
        this.socialLinkForm.reset();
      });
    }
  }

  deleteSocialLink(id: string) {
    this.userProfileService.deleteSocialLink(id).subscribe(() => {
      this.loadSocialLinks();
    });
  }
}
