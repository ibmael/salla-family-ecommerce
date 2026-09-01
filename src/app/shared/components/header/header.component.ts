import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, Moon, Search, ShoppingBag, Sun, User } from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { CartStore } from '../../../core/state/cart.store';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ThemeStore } from '../../../core/state/theme.store';
import { WishlistStore } from '../../../core/state/wishlist.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly cart = inject(CartStore);
  readonly wishlist = inject(WishlistStore);
  readonly auth = inject(MockAuthStore);
  readonly theme = inject(ThemeStore);

  readonly logo = ASSETS.logo;
  readonly wordmark = ASSETS.wordmark;
  readonly icons = { Search, ShoppingBag, Heart, User, Sun, Moon };

  query = '';

  search(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.query.trim() } });
    }
  }
}
