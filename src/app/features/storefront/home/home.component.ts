import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ASSETS } from '../../../core/constants/assets';
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, RevealOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);

  readonly heroImage = ASSETS.hero;

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
