import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  LucideAngularModule,
  Menu,
  Bell,
  Store,
  ExternalLink,
  Shield,
  Sun,
  Moon,
} from 'lucide-angular';
import { MockAuthStore } from '../../../../core/state/auth.store';
import { ThemeStore } from '../../../../core/state/theme.store';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  private readonly router = inject(Router);
  readonly auth  = inject(MockAuthStore);
  readonly theme = inject(ThemeStore);
  readonly toggleSidebar = output<void>();

  readonly icons = {
    Menu,
    Bell,
    Store,
    ExternalLink,
    Shield,
    Sun,
    Moon,
  };

  readonly currentTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.resolveTitle(e.urlAfterRedirects || e.url)),
      startWith(this.resolveTitle(this.router.url)),
    ),
    { initialValue: this.resolveTitle(this.router.url) },
  );

  private resolveTitle(url: string): string {
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.includes('/admin/audit-logs')) return 'Audit Logs';
    if (cleanUrl.includes('/admin/products')) return 'Products';
    if (cleanUrl.match(/\/admin\/orders\/.+/)) return 'Order Details';
    if (cleanUrl.includes('/admin/orders')) return 'Orders';
    if (cleanUrl.match(/\/admin\/customers\/.+/)) return 'Customer Details';
    if (cleanUrl.includes('/admin/customers')) return 'Customers';
    if (cleanUrl.includes('/admin/categories')) return 'Categories';
    return 'Dashboard';
  }

  readonly userInitials = computed<string>(() => {
    const user = this.auth.user();
    if (!user) return 'AD';
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  });
}
