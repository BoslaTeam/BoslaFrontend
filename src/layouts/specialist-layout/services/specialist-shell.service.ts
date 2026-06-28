import { inject, Injectable } from '@angular/core';
import { SpecialistProfileStore } from '@features/specialists/store/specialist-profile.store';

@Injectable({ providedIn: 'root' })
export class SpecialistShellService {
  private readonly profileStore = inject(SpecialistProfileStore);

  bootstrap(): void {
    this.profileStore.loadMyData();
  }
}
