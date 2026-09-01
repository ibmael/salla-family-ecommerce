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
    },
    {
      id: 'slide-2',
      image: ASSETS.categories.home,
      eyebrow: 'Home & living',
      heading: 'Designed for everyday spaces',
      description: 'Warm textures and thoughtful details for the home you love.',
      ctaText: 'Explore home',
      ctaLink: '/category/home',
    },
    {
      id: 'slide-3',
      image: ASSETS.categories.apparel,
      eyebrow: 'The edit',
      heading: 'Details that make it yours',
      description: 'From refined essentials to statement wardrobe pieces.',
      ctaText: 'Shop apparel',
      ctaLink: '/category/apparel',
    },
  ];

  readonly activeIndex = signal<number>(0);
  readonly isPaused = signal<boolean>(false);

  private autoplayTimer?: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_INTERVAL = 5000;
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
      });

      // Start initial autoplay if reduced motion is disabled
      if (!this.prefersReducedMotion) {
        this.startAutoplay();
      }

      // Visibility change listener to pause when tab is hidden
      const handleVisibilityChange = () => {
        if (document.hidden) {
          this.stopAutoplay();
        } else if (!this.isPaused() && !this.prefersReducedMotion) {
          this.startAutoplay();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      this.destroyRef.onDestroy(() => {
        this.stopAutoplay();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        this.emblaApi?.destroy();
      });
    });
  }

  // --- Strict Single-Timer Autoplay Engine ---
  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay(); // Guarantees exactly ONE active timer at all times
    if (this.prefersReducedMotion) return;

    this.autoplayTimer = setInterval(() => {
      if (this.emblaApi && !this.isPaused() && !document.hidden) {
        this.emblaApi.scrollNext();
      }
    }, this.AUTOPLAY_INTERVAL);
  }

  // Navigation handlers with timer reset
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
      this.startAutoplay();
    }
  }

  // Hover & Focus management
  onHeroMouseEnter(): void {
    this.isPaused.set(true);
    this.stopAutoplay();
  }

  onHeroMouseLeave(): void {
    this.isPaused.set(false);
    this.startAutoplay();
  }

  onHeroFocusIn(): void {
    this.isPaused.set(true);
    this.stopAutoplay();
  }

  onHeroFocusOut(): void {
    this.isPaused.set(false);
    this.startAutoplay();
  }
}
