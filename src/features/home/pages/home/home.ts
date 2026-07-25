import { Component, inject, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, DestroyRef, NgZone, effect, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LookupService } from '@core/services/lookup.service';
import { TranslationService } from '@core/services/translation.service';
import { SpecialistService } from '@features/specialists/services/specialist.service';
import { AiSearchService } from '@features/ai/services/ai-search.service';
import { LookupItemDto } from '@core/contracts/lookup.contracts';
import { SpecialistListItemDto } from '@features/specialists/contracts/specialist.contracts';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { UiDomainIcon } from '@shared/ui/domain-icon/domain-icon';

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule, UiDomainIcon, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private lookupService = inject(LookupService);
  readonly translationService = inject(TranslationService);
  private specialistService = inject(SpecialistService);
  private aiSearchService = inject(AiSearchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  @ViewChild('networkCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  expertiseList: LookupItemDto[] = [];
  displayedExpertise: LookupItemDto[] = [];
  featuredSpecialists: SpecialistListItemDto[] = [];
  recommendedSpecialists: SpecialistListItemDto[] = [];
  searchQuery = '';

  // Typewriter
  typewriterText = '';
  typewriterWords: string[] = [];
  private typewriterIndex = 0;
  private charIndex = 0;
  private isDeleting = true;
  private typewriterTimer: any = null;
  private readonly langEffect = effect(() => {
    this.translationService.currentLang();
    this.loadTypewriterWords();
    this.resetTypewriter();
  });

  // Animated counters
  counters = { specialists: 0, consultations: 0, fields: 0 };
  private counterTargets = { specialists: 500, consultations: 10, fields: 15 };
  private countersAnimated = false;

  // Custom Cursor state (moved to layout)
  // WebGL Background variables (moved to layout)

  ngOnInit() {
    this.lookupService.getExpertise().subscribe({
      next: (res) => {
        this.expertiseList = res;
        this.displayedExpertise = res.slice(0, 8);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load expertise', err)
    });

    this.aiSearchService.getRecommendations(6).subscribe({
      next: (res) => {
        this.recommendedSpecialists = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load AI recommendations', err),
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
    if (typeof window !== 'undefined') {
      document.body.classList.add('page-dark');
      this.initGsapAnimations();
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('page-dark');
      if (this.typewriterTimer) clearTimeout(this.typewriterTimer);
    }
  }

  /* ── GSAP Scroll Animations ── */
  private initGsapAnimations() {
    if (typeof window === 'undefined') return;
    
    // Hero entry animations
    gsap.fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.fromTo('.hero-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo('.hero-search-wrap', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, delay: 0.6, ease: 'back.out(1.7)' });
    gsap.fromTo('.interactive-card', { opacity: 0, x: 50, rotateY: 15 }, { opacity: 1, x: 0, rotateY: 0, duration: 1.5, delay: 0.8, ease: 'power3.out' });

    // Section scroll animations
    const sections = gsap.utils.toArray('.section-enter') as HTMLElement[];
    sections.forEach(sec => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }


  /* ── Typewriter Words (translatable) ── */
  private loadTypewriterWords(): void {
    this.typewriterWords = [
      this.translationService.translate('home.typewriter.rightExpert'),
      this.translationService.translate('home.typewriter.rightConsultation'),
      this.translationService.translate('home.typewriter.rightFuture'),
    ];
  }

  private resetTypewriter(): void {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.typewriterIndex = 0;
    this.charIndex = 0;
    this.isDeleting = true;
    this.typewriterText = '';
    this.startTypewriter();
  }

  /* ── Typewriter ── */
  private startTypewriter() {
    if (!this.typewriterWords.length) {
      this.typewriterText = '';
      return;
    }
    this.charIndex = this.typewriterWords[0].length;
    this.isDeleting = true;

    const tick = () => {
      const word = this.typewriterWords[this.typewriterIndex] || '';
      if (this.isDeleting) {
        this.typewriterText = word.substring(0, this.charIndex--);
      } else {
        this.typewriterText = word.substring(0, this.charIndex++);
      }

      this.cdr.markForCheck();

      if (!this.isDeleting && this.charIndex > word.length) {
        this.isDeleting = true;
        this.typewriterTimer = setTimeout(tick, 2000);
        return;
      }
      if (this.isDeleting && this.charIndex < 0) {
        this.isDeleting = false;
        this.typewriterIndex = (this.typewriterIndex + 1) % this.typewriterWords.length;
        this.typewriterTimer = setTimeout(tick, 400);
        return;
      }

      this.typewriterTimer = setTimeout(tick, this.isDeleting ? 40 : 80);
    };
    tick();
  }

  /* ── Domain name translation ── */
  getDomainName(name: string): string {
    return this.translationService.domainName(name);
  }

  /* ── Intersection Observer ── */
  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return;

    const sections = document.querySelectorAll('.stats-trigger');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.countersAnimated) {
            this.animateCounters();
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

