import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecialistsFilters } from '@features/specialists/contracts/specialist-filters.contract';
import { SpecialistListStore } from '@features/specialists/store/specialist-list.store';
import { UiPagination } from "@shared/ui/pagination/pagination";
import { SpecialistsGridComponent } from "@features/specialists/components/specialists-grid/specialists-grid";
import { UiEmptyState } from "@shared/ui/empty-state/empty-state";
import { SpecialistsFiltersComponent } from '@features/specialists/components/specialist-filters/specialist-filters';

@Component({
  selector: 'app-specialist-list-page',
  imports: [SpecialistsFiltersComponent, UiPagination, SpecialistsGridComponent, UiEmptyState],
  standalone: true,
  templateUrl: './specialist-list.html',
})
export class SpecialistListPage implements OnInit {
  readonly store = inject(SpecialistListStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.store.loadLookups();

    this.route.queryParamMap.subscribe(params => {
      const query = params.get('query');

      if (query) {
        this.store.updateFilters({
          searchTerm: query,
          pageNumber: 1,
        });
      } else {
        this.store.loadSpecialists(this.store.filters());
      }
    });
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
