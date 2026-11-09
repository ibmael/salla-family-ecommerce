import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-angular';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { ASSETS } from '../../../../core/constants/assets';

export const HERO_AUTOPLAY_MS = 5000;

export interface HeroSlide {
  id: string;
  image: string;
  eyebrow: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  objectPosition: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: ASSETS.hero,
    eyebrow: 'New season',
    heading: 'Curated for living well',
    description: 'Discover pieces that feel as good as they look.',
    ctaText: 'Shop the edit',
    ctaLink: '/category',
    secondaryCtaText: 'View catalog',
    secondaryCtaLink: '/categories',
    objectPosition: 'center',
  },
  {
    id: 'slide-2',
    image: ASSETS.categories.home,
    eyebrow: 'Home & living',
    heading: 'Designed for everyday spaces',
    description: 'Warm textures and thoughtful details for the home you love.',
    ctaText: 'Explore home',
    ctaLink: '/category/home',
    secondaryCtaText: 'All collections',
    secondaryCtaLink: '/categories',
    objectPosition: 'center 60%',
  },
  {
    id: 'slide-3',
    image: ASSETS.categories.apparel,
    eyebrow: 'The edit',
    heading: 'Details that make it yours',
    description: 'From refined essentials to statement wardrobe pieces.',
    ctaText: 'Shop apparel',
    ctaLink: '/category/apparel',
    secondaryCtaText: 'Explore all',
    secondaryCtaLink: '/categories',
    objectPosition: 'center 35%',
  },
];

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCarouselComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly slides = input<HeroSlide[]>(DEFAULT_HERO_SLIDES);

  readonly emblaViewport = viewChild<ElementRef<HTMLElement>>('emblaViewport');
  private emblaApi?: EmblaCarouselType;

  readonly icons = { ChevronLeft, ChevronRight, ArrowRight };

  readonly activeIndex = signal<number>(0);
  readonly isPaused = signal<boolean>(false);
  readonly progressKey = signal<number>(0);

  private autoplayTimer?: ReturnType<typeof setTimeout>;
  private prefersReducedMotion = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = mediaQuery.matches;

      const viewportNode = this.emblaViewport()?.nativeElement;
      if (!viewportNode) return;

      this.emblaApi = EmblaCarousel(viewportNode, {
        loop: true,
        align: 'center',
        skipSnaps: false,
        duration: this.prefersReducedMotion ? 0 : 25,
      });

      this.emblaApi.on('select', () => {
        if (!this.emblaApi) return;
        this.activeIndex.set(this.emblaApi.selectedScrollSnap());
        this.progressKey.update((k) => k + 1);
      });

      this.emblaApi.on('pointerDown', () => {
        this.isPaused.set(true);
        this.clearScheduled();
      });

      this.emblaApi.on('pointerUp', () => {
        this.isPaused.set(false);
        this.scheduleNext();
      });

      // Autoplay: scheduled on render
      this.scheduleNext();

      // Page Visibility handling
      const handleVisibility = () => {
        if (document.hidden) {
          this.clearScheduled();
        } else if (!this.isPaused() && !this.prefersReducedMotion) {
          this.scheduleNext();
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      this.destroyRef.onDestroy(() => {
        this.clearScheduled();
        document.removeEventListener('visibilitychange', handleVisibility);
        this.emblaApi?.destroy();
      });
    });
  }

  // ── Autoplay Scheduling ──
  private clearScheduled(): void {
    if (this.autoplayTimer != null) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  private scheduleNext(): void {
    this.clearScheduled();
    this.autoplayTimer = setTimeout(() => {
      if (this.emblaApi && !this.isPaused() && !document.hidden) {
        this.emblaApi.scrollNext();
        this.scheduleNext();
      }
    }, HERO_AUTOPLAY_MS);
  }

  // ── Manual Navigation Handlers ──
  scrollPrev(): void {
    if (!this.emblaApi) return;
    this.emblaApi.scrollPrev();
    this.restartAutoplay();
  }

  scrollNext(): void {
    if (!this.emblaApi) return;
    this.emblaApi.scrollNext();
    this.restartAutoplay();
  }

  scrollTo(index: number): void {
    if (!this.emblaApi) return;
    this.emblaApi.scrollTo(index);
    this.restartAutoplay();
  }

  onSlideClick(index: number): void {
    if (this.activeIndex() !== index) {
      this.scrollTo(index);
    }
  }

  private restartAutoplay(): void {
    if (!this.isPaused()) {
      this.scheduleNext();
    }
  }

  // ── Hover & Focus Listeners ──
  onHeroMouseEnter(): void {
    this.isPaused.set(true);
    this.clearScheduled();
  }

  onHeroMouseLeave(): void {
    this.isPaused.set(false);
    this.scheduleNext();
  }

  onHeroFocusIn(): void {
    this.isPaused.set(true);
    this.clearScheduled();
  }

  onHeroFocusOut(): void {
    this.isPaused.set(false);
    this.scheduleNext();
  }
}

