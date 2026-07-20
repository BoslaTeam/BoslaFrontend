import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
interface LookupItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-admin-lookups',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './admin-lookups.html',
  styleUrl: './admin-lookups.css',
})
export class AdminLookups implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

  readonly activeTab = signal<'expertise' | 'skills' | 'tools' | 'industries'>('expertise');
  readonly items = signal<LookupItem[]>([]);
  readonly isLoading = signal(false);
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);

  editId: string | null = null;
  formName = '';

  ngOnInit(): void {
    this.loadItems();
  }

  setTab(tab: 'expertise' | 'skills' | 'tools' | 'industries'): void {
    this.activeTab.set(tab);
    this.closeForm();
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading.set(true);
    const tab = this.activeTab();
    const obs = tab === 'expertise'
      ? this.adminService.getExpertiseList()
      : tab === 'skills'
        ? this.adminService.getSkillList()
        : tab === 'tools'
          ? this.adminService.getToolList()
          : this.adminService.getIndustryList();

    obs.subscribe({
      next: (data) => { this.items.set(data); this.isLoading.set(false); },
      error: () => { this.items.set([]); this.isLoading.set(false); },
    });
  }

  openAdd(): void {
    this.editId = null;
    this.formName = '';
    this.isEditing.set(false);
    this.showForm.set(true);
  }

  openEdit(item: LookupItem): void {
    this.editId = item.id;
    this.formName = item.name;
    this.isEditing.set(true);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editId = null;
    this.formName = '';
    this.isEditing.set(false);
  }

  save(): void {
    const name = this.formName.trim();
    if (!name) return;

    this.isSaving.set(true);
    const tab = this.activeTab();

    if (this.isEditing() && this.editId) {
      const obs = tab === 'expertise'
        ? this.adminService.updateExpertise(this.editId, name)
        : tab === 'skills'
          ? this.adminService.updateSkill(this.editId, name)
          : tab === 'tools'
            ? this.adminService.updateTool(this.editId, name)
            : this.adminService.updateIndustry(this.editId, name);

      obs.subscribe({
        next: () => { this.isSaving.set(false); this.closeForm(); this.loadItems(); },
        error: () => this.isSaving.set(false),
      });
    } else {
      const obs = tab === 'expertise'
        ? this.adminService.createExpertise(name)
        : tab === 'skills'
          ? this.adminService.createSkill(name)
          : tab === 'tools'
            ? this.adminService.createTool(name)
            : this.adminService.createIndustry(name);

      obs.subscribe({
        next: () => { this.isSaving.set(false); this.closeForm(); this.loadItems(); },
        error: () => this.isSaving.set(false),
      });
    }
  }

  deleteItem(item: LookupItem): void {
    if (!confirm(this.translationService.translate('admin.lookups.confirmDelete') + " " + item.name + "?")) return;

    const tab = this.activeTab();
    const obs = tab === 'expertise'
      ? this.adminService.deleteExpertise(item.id)
      : tab === 'skills'
        ? this.adminService.deleteSkill(item.id)
        : tab === 'tools'
          ? this.adminService.deleteTool(item.id)
          : this.adminService.deleteIndustry(item.id);

    obs.subscribe({ next: () => this.loadItems() });
  }

  getTabTitle(): string {
    const titles: Record<string, string> = {
      expertise: this.translationService.translate('admin.lookupType.expertise'),
      skills: this.translationService.translate('admin.lookupType.skills'),
      tools: this.translationService.translate('admin.lookupType.tools'),
      industries: this.translationService.translate('admin.lookupType.industries'),
    };
    return titles[this.activeTab()] ?? '';
  }

  getItemCountLabel(): string {
    const count = this.items().length;
    const titles: Record<string, string> = {
      expertise: this.translationService.translate('admin.lookupType.expertise_singular'),
      skills: this.translationService.translate('admin.lookupType.skill_singular'),
      tools: this.translationService.translate('admin.lookupType.tool_singular'),
      industries: this.translationService.translate('admin.lookupType.industry_singular'),
    };
    return `${count} ${titles[this.activeTab()] ?? ''}`;
  }
}
