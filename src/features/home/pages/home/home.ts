import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LookupService } from '@core/services/lookup.service';
import { SpecialistService } from '@features/specialists/services/specialist.service';
import { LookupItemDto } from '@core/contracts/lookup.contracts';
import { SpecialistListItemDto } from '@features/specialists/contracts/specialist.contracts';
import { CommonModule } from '@angular/common';

import { UiDomainIcon } from '@shared/ui/domain-icon/domain-icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule, UiDomainIcon],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  private lookupService = inject(LookupService);
  private specialistService = inject(SpecialistService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  expertiseList: LookupItemDto[] = [];
  featuredSpecialists: SpecialistListItemDto[] = [];
  searchQuery = '';

  // Typewriter
  typewriterText = '';
  private typewriterWords = ['الخبير المناسب', 'الاستشارة المناسبة', 'المستقبل المناسب'];
  private typewriterIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  // Animated counters
  counters = { specialists: 0, consultations: 0, fields: 0 };
  private counterTargets = { specialists: 500, consultations: 10, fields: 15 };
  private countersAnimated = false;

  // Particles
  particles: { x: number; y: number; delay: number; dx: number; dy: number }[] = [];

  ngOnInit() {
    this.generateParticles();
    this.startTypewriter();

    this.lookupService.getExpertise().subscribe({
      next: (res) => {
        this.expertiseList = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load expertise', err)
    });

    this.specialistService.getSpecialists({ pageNumber: 1, pageSize: 6 }).subscribe({
      next: (res) => {
        this.featuredSpecialists = res.items;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load specialists', err)
    });
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  /* ── Particle generation ── */
  private generateParticles() {
    this.particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      dx: (Math.random() - 0.5) * 160,
      dy: (Math.random() - 0.5) * 120,
    }));
  }

  /* ── Typewriter ── */
  private startTypewriter() {
    const tick = () => {
      const word = this.typewriterWords[this.typewriterIndex];
      if (this.isDeleting) {
        this.typewriterText = word.substring(0, this.charIndex--);
      } else {
        this.typewriterText = word.substring(0, this.charIndex++);
      }

      if (!this.isDeleting && this.charIndex > word.length) {
        this.isDeleting = true;
        setTimeout(tick, 2000);
        return;
      }
      if (this.isDeleting && this.charIndex < 0) {
        this.isDeleting = false;
        this.typewriterIndex = (this.typewriterIndex + 1) % this.typewriterWords.length;
        setTimeout(tick, 400);
        return;
      }

      this.cdr.markForCheck();
      setTimeout(tick, this.isDeleting ? 40 : 80);
    };
    tick();
  }

  /* ── Intersection Observer ── */
  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return;

    const sections = document.querySelectorAll('.section-enter');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            // Trigger counters when stats section appears
            if (entry.target.classList.contains('stats-trigger') && !this.countersAnimated) {
              this.animateCounters();
            }
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sections.forEach((s) => observer.observe(s));

    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  /* ── Animated Counters ── */
  private animateCounters() {
    this.countersAnimated = true;
    const steps = 40;
    let step = 0;

    const tick = () => {
      step++;
      this.counters = {
        specialists: Math.min(Math.round((this.counterTargets.specialists / steps) * step), this.counterTargets.specialists),
        consultations: Math.min(Math.round((this.counterTargets.consultations / steps) * step), this.counterTargets.consultations),
        fields: Math.min(Math.round((this.counterTargets.fields / steps) * step), this.counterTargets.fields),
      };
      this.cdr.markForCheck();
      if (step < steps) setTimeout(tick, 30);
    };
    tick();
  }

  /* ── Search ── */
  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/specialists'], { queryParams: { query: this.searchQuery } });
    }
  }
}
