import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';
import {
  LucideAngularModule,
  ChevronDown,
  Check,
  Percent,
} from 'lucide-angular';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import {
  BreadcrumbsComponent,
  BreadcrumbItem,
} from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

export type SortValue = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export interface SortOptionItem {
  value: SortValue;
  label: string;
}

@Component({
  selector: 'app-catalog',
  imports: [
    RouterLink,
    ProductCardComponent,
    PaginationComponent,
    SkeletonComponent,
    BreadcrumbsComponent,
    LucideAngularModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);
  private readonly pageTitle = inject(PageTitleService);
  private readonly elementRef = inject(ElementRef);

  readonly icons = { ChevronDown, Check, Percent };

  readonly sortOptions: SortOptionItem[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' }
  );
  readonly query = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('q') ?? '')),
    { initialValue: '' }
  );
  readonly category = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.categoryRepo.bySlug(p.get('slug') ?? ''))
    ),
    { initialValue: undefined }
  );

  readonly sort = signal<SortValue>('featured');
  readonly saleOnly = signal<boolean>(false);
  readonly page = signal<number>(1);
  readonly loading = signal<boolean>(true);

  readonly isSortOpen = signal<boolean>(false);
  readonly focusedSortIndex = signal<number>(0);

  readonly currentSortLabel = computed(() => {
    const current = this.sort();
    return this.sortOptions.find((o) => o.value === current)?.label ?? 'Featured';
  });

  // Fully reactive single source of truth for catalog results
  readonly result = toSignal(
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      toObservable(this.page),
      toObservable(this.sort),
      toObservable(this.saleOnly),
    ]).pipe(
      switchMap(([params, queryParams, currentPage, currentSort, onSale]) => {
        this.loading.set(true);
        const slug = params.get('slug') ?? '';
        const searchQ = queryParams.get('q') ?? '';
        return this.categoryRepo.bySlug(slug).pipe(
          switchMap((cat) =>
            this.productRepo.list({
              categoryId: cat?.id,
              query: searchQ || undefined,
              onSale: onSale || undefined,
              sort: currentSort,
              page: currentPage,
              pageSize: 12,
            })
          ),
          map((res) => {
            this.loading.set(false);
            return res;
          })
        );
      })
    ),
    { initialValue: { items: [], total: 0, page: 1, pageSize: 12, totalPages: 1 } }
  );

  readonly title = computed(() => {
    if (this.query()) return `Results for "${this.query()}"`;
    if (this.category()) return this.category()!.name;
    return 'All pieces';
  });

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const cat = this.category();
    if (cat) {
      return [
        { label: 'Home', url: '/' },
        { label: 'Categories', url: '/categories' },
        { label: cat.name },
      ];
    }
    return [
      { label: 'Home', url: '/' },
      { label: 'Shop' },
    ];
  });

  constructor() {
    effect(() => this.pageTitle.set(this.title()));
  }

  onPageChange(p: number): void {
    this.page.set(p);
    if (typeof window !== 'undefined') {
      const headingEl = document.getElementById('catalog-heading');
      if (headingEl) {
        headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  toggleSaleOnly(): void {
    this.saleOnly.update((v) => !v);
    this.page.set(1);
  }

  toggleSort(): void {
    const next = !this.isSortOpen();
    this.isSortOpen.set(next);
    if (next) {
      const idx = this.sortOptions.findIndex((o) => o.value === this.sort());
      this.focusedSortIndex.set(idx >= 0 ? idx : 0);
    }
  }

  closeSort(): void {
    this.isSortOpen.set(false);
  }

  selectSort(option: SortValue): void {
    this.sort.set(option);
    this.page.set(1);
    this.closeSort();
  }

  onSortKeydown(event: KeyboardEvent): void {
    if (!this.isSortOpen()) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleSort();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedSortIndex.update((i) =>
        i < this.sortOptions.length - 1 ? i + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedSortIndex.update((i) =>
        i > 0 ? i - 1 : this.sortOptions.length - 1
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const selected = this.sortOptions[this.focusedSortIndex()];
      if (selected) {
        this.selectSort(selected.value);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSort();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeSort();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSort();
  }
}
