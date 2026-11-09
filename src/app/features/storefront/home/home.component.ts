import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../core/repositories/repository.tokens';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import {
  DEFAULT_HERO_SLIDES,
  HeroCarouselComponent,
  HeroSlide,
  HERO_AUTOPLAY_MS,
} from './hero-carousel/hero-carousel.component';

export type { HeroSlide };
export { HERO_AUTOPLAY_MS };

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ProductCardComponent,
    RevealOnScrollDirective,
    HeroCarouselComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);

  readonly slides: HeroSlide[] = DEFAULT_HERO_SLIDES;

  readonly data = toSignal(
    forkJoin({
      categories: this.categoryRepo.list(),
      trending: this.productRepo.trending(),
      deals: this.productRepo.deals(),
      featured: this.productRepo.featured(),
    }),
    { initialValue: { categories: [], trending: [], deals: [], featured: [] } },
  );
}
