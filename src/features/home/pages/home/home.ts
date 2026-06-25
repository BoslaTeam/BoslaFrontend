import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LookupService } from '@core/services/lookup.service';
import { SpecialistService } from '@features/specialists/services/specialist.service';
import { LookupItemDto } from '@core/contracts/lookup.contracts';
import { SpecialistListItemDto } from '@features/specialists/contracts/specialist.contracts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private lookupService = inject(LookupService);
  private specialistService = inject(SpecialistService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  expertiseList: LookupItemDto[] = [];
  featuredSpecialists: SpecialistListItemDto[] = [];
  searchQuery: string = '';

  ngOnInit() {
    this.lookupService.getExpertise().subscribe({
      next: (res) => {
        this.expertiseList = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load expertise', err)
    });

    this.specialistService.getSpecialists({ pageNumber: 1, pageSize: 4 }).subscribe({
      next: (res) => {
        this.featuredSpecialists = res.items;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load specialists', err)
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/specialists'], { queryParams: { query: this.searchQuery } });
    }
  }

  getDomainEmoji(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('قانون') || lowerName.includes('law')) return '⚖️';
    if (lowerName.includes('مال') || lowerName.includes('financ')) return '💰';
    if (lowerName.includes('تقني') || lowerName.includes('tech') || lowerName.includes('برمج')) return '💻';
    if (lowerName.includes('صحة') || lowerName.includes('طب') || lowerName.includes('health')) return '🏥';
    if (lowerName.includes('تعليم') || lowerName.includes('تدريب') || lowerName.includes('education')) return '🎓';
    if (lowerName.includes('تسويق') || lowerName.includes('marketing')) return '📊';
    if (lowerName.includes('تصميم') || lowerName.includes('design')) return '🎨';
    if (lowerName.includes('إدارة') || lowerName.includes('management') || lowerName.includes('اعمال') || lowerName.includes('أعمال')) return '📈';
    return '✨';
  }
}
