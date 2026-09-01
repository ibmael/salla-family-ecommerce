import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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

export interface HeroSlide {
  id: string;
  image: string;
  eyebrow: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
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

  readonly emblaViewport = viewChild<ElementRef<HTMLElement>>('emblaViewport');
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
      objectPosition: 'center 35%',
    },
  ];

  readonly activeIndex = signal<number>(0);
  readonly isPaused = signal<boolean>(false);

  /** CSS animation key — increments on every slide change to force progress restart */
  readonly progressKey = signal<number>(0);

  private autoplayTimer?: ReturnType<typeof setTimeout>;
  private readonly AUTOPLAY_MS = 5000;
  private prefersReducedMotion = false;

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
        // Bump progressKey so CSS animation restarts from 0%
        this.progressKey.update((k) => k + 1);
      });

      if (!this.prefersReducedMotion) {
        this.scheduleNext();
      }

      // Pause/resume on document visibility
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

  // ── Single-timer autoplay: setTimeout (not setInterval) ──
  private clearScheduled(): void {
    if (this.autoplayTimer != null) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  private scheduleNext(): void {
    this.clearScheduled();
    if (this.prefersReducedMotion) return;

    this.autoplayTimer = setTimeout(() => {
      if (this.emblaApi && !this.isPaused() && !document.hidden) {
        this.emblaApi.scrollNext();
        // After scrollNext triggers 'select', scheduleNext is called again
        // via the restartAutoplay path — but we also call it here defensively
        this.scheduleNext();
      }
    }, this.AUTOPLAY_MS);
  }

  // ── Navigation handlers ──
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

  // ── Hover & Focus ──
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
