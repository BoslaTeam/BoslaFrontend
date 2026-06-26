import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpecialistsFilters } from '@features/specialists/contracts/specialist-filters.contract';
import { SpecialistsStore } from '@features/specialists/store/specialists.store';
import { UiPagination } from "@shared/ui/pagination/pagination";
import { SpecialistsGridComponent } from "@features/specialists/components/specialists-grid/specialists-grid";
import { UiEmptyState } from "@shared/ui/empty-state/empty-state";
import { SpecialistsFiltersComponent } from '@features/specialists/components/specialist-filters/specialist-filters';

@Component({
  selector: 'app-specialist-list-page',
  imports: [SpecialistsFiltersComponent, UiPagination, SpecialistsGridComponent, UiEmptyState],
  standalone: true,
  templateUrl: './specialist-list.html',
  styleUrl: './specialist-list.css',
})
export class SpecialistListPage implements OnInit {
  readonly store = inject(SpecialistsStore);
  private readonly router = inject(Router);

  ngOnInit() {
    this.store.loadLookups();

    // نعتمد هنا على الفلاتر الافتراضية المخزنة داخل الـ Store
    this.store.loadSpecialists(this.store.filters());
  }

  onFiltersChanged(filters: Partial<SpecialistsFilters>) {
    this.store.updateFilters(filters);
  }

  onPageChanged(page: number) {
    this.store.updateFilters({
      pageNumber: page,
    });
  }

  onSpecialistSelected(id: string) {
    this.router.navigate(['/specialists', id]);
  }
}
