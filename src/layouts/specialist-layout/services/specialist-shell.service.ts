import { inject, Injectable } from '@angular/core';
import { ProfileStore } from '@features/profile/stores/profile.store';

@Injectable({ providedIn: 'root' })
export class SpecialistShellService {
  private readonly profileStore = inject(ProfileStore);

  bootstrap(): void {
    this.profileStore.loadProfileData();
  }
}
