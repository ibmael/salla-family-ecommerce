import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { WishlistStore } from '../../../core/state/wishlist.store';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistComponent {
  private readonly repo = inject(PRODUCT_REPOSITORY);
  readonly wishlist = inject(WishlistStore);

  private readonly allProducts = toSignal(
    this.repo.list({ pageSize: 50 }).pipe(map((r) => r.items)),
    { initialValue: [] },
  );

  readonly products = computed(() => {
    const ids = this.wishlist.ids();
    return this.allProducts().filter((p) => ids.includes(p.id));
  });
}
