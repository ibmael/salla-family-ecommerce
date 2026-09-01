import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShoppingBag, Check } from 'lucide-angular';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../../core/state/cart.store';
import { WishlistStore } from '../../../core/state/wishlist.store';
import { MockAuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly wishlist = inject(WishlistStore);
  readonly cart = inject(CartStore);
  readonly auth = inject(MockAuthStore);

  readonly icons = { ShoppingBag, Check };

  readonly isInCart = computed(() => {
    const p = this.product();
    if (!p || !this.auth.isLoggedIn()) return false;
    return this.cart.has(p.id, p.sizes[0] ?? '', p.colors[0] ?? '');
  });

  toggleWishlist(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(id);
  }

  toggleCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    this.cart.toggle(p, p.sizes[0] ?? '', p.colors[0] ?? '', 1);
  }
}
