import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { PageTitleService } from '../../../core/services/page-title.service';
import { PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { CartStore } from '../../../core/state/cart.store';
import { RecentViewsStore } from '../../../core/state/recent-views.store';
import { WishlistStore } from '../../../core/state/wishlist.store';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'app-product',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly repo = inject(PRODUCT_REPOSITORY);
  private readonly recent = inject(RecentViewsStore);
  private readonly toast = inject(ToastService);
  private readonly pageTitle = inject(PageTitleService);

  readonly cart = inject(CartStore);
  readonly wishlist = inject(WishlistStore);

  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((x) => x.get('slug') ?? ''),
      switchMap((slug) => this.repo.bySlug(slug)),
    ),
    { initialValue: undefined },
  );

  readonly related = toSignal(
    this.route.paramMap.pipe(
      map((x) => x.get('slug') ?? ''),
      switchMap((slug) =>
        this.repo.bySlug(slug).pipe(switchMap((p) => (p ? this.repo.related(p.id) : []))),
      ),
    ),
    { initialValue: [] },
  );

  readonly reviews = toSignal(
    this.route.paramMap.pipe(
      map((x) => x.get('slug') ?? ''),
      switchMap((slug) =>
        this.repo.bySlug(slug).pipe(switchMap((p) => (p ? this.repo.reviews(p.id) : []))),
      ),
    ),
    { initialValue: [] },
  );

  readonly recentProducts = toSignal(this.repo.list({ pageSize: 4 }), { initialValue: { items: [], total: 0, page: 1, pageSize: 4, totalPages: 1 } });

  readonly size = signal('');
  readonly color = signal('');
  readonly quantity = signal(1);
  readonly showVideo = signal(false);
  readonly Math = Math;

  constructor() {
    effect(() => {
      const product = this.product();
      this.pageTitle.set(product?.name ?? 'Product');
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    const size = this.size() || p.sizes[0];
    const color = this.color() || p.colors[0];
    this.cart.add(p, size, color, this.quantity());
    this.recent.add(p.id);
    this.toast.success('Your selection is ready in the bag', 'Added');
  }
}
