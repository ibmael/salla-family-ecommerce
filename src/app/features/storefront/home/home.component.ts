import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-angular';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { ASSETS } from '../../../core/constants/assets';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../core/repositories/repository.tokens';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

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

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ProductCardComponent,
    RevealOnScrollDirective,
    LucideAngularModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly emblaViewport = viewChild<ElementRef<HTMLElement>>('emblaViewport');
  readonly heroContainer = viewChild<ElementRef<HTMLElement>>('heroContainer');
  private emblaApi?: EmblaCarouselType;

  readonly icons = { ChevronLeft, ChevronRight, ArrowRight };

  readonly slides: HeroSlide[] = [
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

  readonly activeIndex = signal<number>(0);
  readonly isPaused = signal<boolean>(false);
  readonly progressKey = signal<number>(0);

  private autoplayTimer?: ReturnType<typeof setTimeout>;
  private prefersReducedMotion = false;
  private rafId?: number;

  readonly data = toSignal(
    forkJoin({
      categories: this.categoryRepo.list(),
      trending: this.productRepo.trending(),
      deals: this.productRepo.deals(),
      featured: this.productRepo.featured(),
    }),
    { initialValue: { categories: [], trending: [], deals: [], featured: [] } },
  );

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = mediaQuery.matches;

      const viewportNode = this.emblaViewport()?.nativeElement;
      if (!viewportNode) return;

      this.emblaApi = EmblaCarousel(viewportNode, {
        loop: true,
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

      // Autoplay: always schedule (even in reduced-motion mode)
      // CSS handles the visual simplification; the carousel remains functional
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

      // Subtle mouse parallax on desktop (outside Angular zone for 60fps performance)
      const container = this.heroContainer()?.nativeElement;
      if (container && !this.prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        this.ngZone.runOutsideAngular(() => {
          const handleMouseMove = (e: MouseEvent) => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame(() => {
              const rect = container.getBoundingClientRect();
              const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
              const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
              container.style.setProperty('--mouse-x', normX.toFixed(3));
              container.style.setProperty('--mouse-y', normY.toFixed(3));
            });
          };

          const handleMouseLeave = () => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            container.style.setProperty('--mouse-x', '0');
            container.style.setProperty('--mouse-y', '0');
          };

          container.addEventListener('mousemove', handleMouseMove, { passive: true });
          container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

          this.destroyRef.onDestroy(() => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
          });
        });
      }

      this.destroyRef.onDestroy(() => {
        this.clearScheduled();
        if (this.rafId) cancelAnimationFrame(this.rafId);
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
