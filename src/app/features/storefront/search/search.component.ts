import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, ProductCardComponent, BreadcrumbsComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly repo = inject(PRODUCT_REPOSITORY);
  private readonly pageTitle = inject(PageTitleService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Search' },
  ];

  readonly query = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')), { initialValue: '' });
  readonly sort = signal<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  readonly result = toSignal(
    this.route.queryParamMap.pipe(
      switchMap((params) =>
        this.repo.list({
          query: params.get('q') ?? undefined,
          sort: this.sort(),
          pageSize: 20,
        }),
      ),
    ),
    { initialValue: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 } },
  );

  constructor() {
    effect(() => {
      const query = this.query().trim();
      this.pageTitle.set(query ? `Search: ${query}` : 'Search');
    });
  }
}
