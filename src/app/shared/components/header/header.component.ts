import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  Heart,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
  Package,
  LogOut,
  ShieldCheck,
} from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { CartStore } from '../../../core/state/cart.store';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ThemeStore } from '../../../core/state/theme.store';
import { WishlistStore } from '../../../core/state/wishlist.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  readonly cart = inject(CartStore);
  readonly wishlist = inject(WishlistStore);
  readonly auth = inject(MockAuthStore);
  readonly theme = inject(ThemeStore);

  readonly logo = ASSETS.logo;
  readonly wordmark = ASSETS.wordmark;
  readonly icons = {
    Search,
    ShoppingBag,
    Heart,
    User,
    Sun,
    Moon,
    Package,
    LogOut,
    ShieldCheck,
  };

  query = '';
  isDropdownOpen = signal<boolean>(false);

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim() || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeDropdown();
  }

  search(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.query.trim() } });
    }
  }

  signOut(): void {
    this.closeDropdown();
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
