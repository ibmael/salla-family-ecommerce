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
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, of, switchMap } from 'rxjs';
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
  ChevronDown,
  ArrowRight,
  X,
} from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { CartStore } from '../../../core/state/cart.store';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ThemeStore } from '../../../core/state/theme.store';
import { WishlistStore } from '../../../core/state/wishlist.store';
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';

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
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);

  readonly cart = inject(CartStore);
  readonly wishlist = inject(WishlistStore);
  readonly auth = inject(MockAuthStore);
  readonly theme = inject(ThemeStore);

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
    ChevronDown,
    ArrowRight,
    X,
  };

  // Categories Dropdown State
  readonly categories = toSignal(this.categoryRepo.list(), { initialValue: [] });
  readonly previewCategories = computed(() => this.categories().slice(0, 4));
  isCategoriesOpen = signal<boolean>(false);

  // Search State & Suggestions (Repository-friendly)
  searchQuery = signal<string>('');
  isSearchFocused = signal<boolean>(false);
  activeSuggestionIndex = signal<number>(-1);

  readonly searchSuggestions = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(120),
      map((q) => q.trim()),
      switchMap((q) => {
        if (!q || q.length < 1) return of([]);
        return this.productRepo.list({ query: q, pageSize: 5 }).pipe(
          map((res) => res.items),
        );
      }),
    ),
    { initialValue: [] },
  );

  readonly isSearchOpen = computed(() => {
    return this.isSearchFocused() && this.searchQuery().trim().length >= 1;
  });

  // Profile Dropdown & Cart Animation
  isProfileOpen = signal<boolean>(false);
  isCartBumping = signal<boolean>(false);
  private bumpTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const ts = this.cart.lastAddedTimestamp();
      if (ts > 0) {
        this.triggerCartBump();
      }
    });
  }

  private triggerCartBump(): void {
    if (this.bumpTimeout) {
      clearTimeout(this.bumpTimeout);
    }
    this.isCartBumping.set(true);
    this.bumpTimeout = setTimeout(() => {
      this.isCartBumping.set(false);
    }, 240);
  }

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim() || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  // Dropdown Management
  toggleCategories(): void {
    this.isCategoriesOpen.update((v) => !v);
    this.isProfileOpen.set(false);
  }

  closeCategories(): void {
    this.isCategoriesOpen.set(false);
  }

  toggleProfile(): void {
    this.isProfileOpen.update((v) => !v);
    this.isCategoriesOpen.set(false);
  }

  closeProfile(): void {
    this.isProfileOpen.set(false);
  }

  closeAllDropdowns(): void {
    this.isCategoriesOpen.set(false);
    this.isProfileOpen.set(false);
    this.isSearchFocused.set(false);
    this.activeSuggestionIndex.set(-1);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeAllDropdowns();
  }

  // Search Interaction Handlers
  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.activeSuggestionIndex.set(-1);
  }

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
    this.isCategoriesOpen.set(false);
    this.isProfileOpen.set(false);
  }

  onSearchBlur(): void {
    // Delay slightly to allow click event on suggestions to register
    setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 180);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.activeSuggestionIndex.set(-1);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const suggestions = this.searchSuggestions();
    if (!this.isSearchOpen()) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex.update((i) =>
        i < suggestions.length - 1 ? i + 1 : 0,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex.update((i) =>
        i > 0 ? i - 1 : suggestions.length - 1,
      );
    } else if (event.key === 'Enter') {
      const idx = this.activeSuggestionIndex();
      if (idx >= 0 && idx < suggestions.length) {
        event.preventDefault();
        this.selectSuggestion(suggestions[idx].slug);
      } else {
        this.submitSearch();
      }
    } else if (event.key === 'Escape') {
      this.isSearchFocused.set(false);
      this.activeSuggestionIndex.set(-1);
    }
  }

  selectSuggestion(slug: string): void {
    this.closeAllDropdowns();
    this.router.navigate(['/product', slug]);
  }

  submitSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.closeAllDropdowns();
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  signOut(): void {
    this.closeAllDropdowns();
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
