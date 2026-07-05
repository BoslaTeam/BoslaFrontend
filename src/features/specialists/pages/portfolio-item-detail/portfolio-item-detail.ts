import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SpecialistsApiService } from '../../data-access/specialist-api.service';
import { PortfolioItemDto } from '../../contracts/specialist-portfolio.contract';

@Component({
  selector: 'app-portfolio-item-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio-item-detail.html',
  styles: [`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out both; }
    .animate-scale-in { animation: scaleIn 0.5s ease-out both; }
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    .stagger-5 { animation-delay: 0.5s; }
    .shimmer-bg {
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .img-zoom { overflow: hidden; }
    .img-zoom img { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .img-zoom:hover img { transform: scale(1.08); }
    .glass-card {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
  `],
})
export class PortfolioItemDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(SpecialistsApiService);

  readonly item = signal<PortfolioItemDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly specialistId = signal('');
  readonly specialistName = signal('');
  readonly previewUrl = signal<string | null>(null);

  readonly allImages = signal<string[]>([]);

  ngOnInit() {
    const specialistId = this.route.snapshot.paramMap.get('id') || '';
    const itemId = this.route.snapshot.paramMap.get('itemId') || '';
    const name = this.route.snapshot.queryParamMap.get('name') || '';

    this.specialistId.set(specialistId);
    this.specialistName.set(name);

    if (specialistId && itemId) {
      this.load(specialistId, itemId);
    }
  }

  private load(specialistId: string, itemId: string) {
    this.loading.set(true);
    this.error.set(false);
    this.api.getPublicPortfolioItem(specialistId, itemId).subscribe({
      next: (res) => {
        const it = res.data;
        if (it) {
          this.item.set(it);
          this.allImages.set([it.coverImageUrl, ...it.images.map(i => i.imageUrl)]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/specialists', this.specialistId()]);
  }

  openPreview(url: string) {
    this.previewUrl.set(url);
  }

  closePreview() {
    this.previewUrl.set(null);
  }
}
