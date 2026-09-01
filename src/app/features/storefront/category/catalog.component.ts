import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-catalog',
  imports: [FormsModule, RouterLink, ProductCardComponent, PaginationComponent, SkeletonComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);
  private readonly pageTitle = inject(PageTitleService);

  readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), { initialValue: '' });
  readonly query = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')), { initialValue: '' });
  readonly category = toSignal(
    this.route.paramMap.pipe(switchMap((p) => this.categoryRepo.bySlug(p.get('slug') ?? ''))),
    { initialValue: undefined },
  );

  readonly sort = signal<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  readonly saleOnly = signal(false);
  readonly page = signal(1);
  readonly loading = signal(true);

  readonly result = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.loading.set(true);
        const slug = params.get('slug') ?? '';
        return this.categoryRepo.bySlug(slug).pipe(
          switchMap((cat) =>
            this.productRepo.list({
              categoryId: cat?.id,
              query: this.query() || undefined,
              onSale: this.saleOnly() || undefined,
              sort: this.sort(),
              page: this.page(),
              pageSize: 12,
            }),
          ),
        );
      }),
    ),
    { initialValue: { items: [], total: 0, page: 1, pageSize: 12, totalPages: 1 } },
  );

  readonly title = computed(() => {
    if (this.query()) return `Results for "${this.query()}"`;
    if (this.category()) return this.category()!.name;
    return 'All pieces';
  });

  constructor() {
    effect(() => this.pageTitle.set(this.title()));
  }

  reload(): void {
    this.page.set(1);
    this.loading.set(false);
  }
}
