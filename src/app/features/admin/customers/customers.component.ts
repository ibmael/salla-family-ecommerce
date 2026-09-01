import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { format, parseISO } from 'date-fns';
import {
  LucideAngularModule,
  Users,
  Search,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Repeat2,
  TrendingUp,
  Mail,
  Phone,
  ArrowUpDown,
} from 'lucide-angular';
import { CUSTOMER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { CustomerProfile } from '../../../core/repositories/repository.tokens';

type SortKey = 'newest' | 'most-orders' | 'highest-spend' | 'name-az';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(iso: string | undefined, pattern: string): string {
  if (!iso) return '—';
  try { return format(parseISO(iso), pattern); } catch { return iso; }
}

function formatMoney(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString('en-US')}`;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomersComponent {
  private readonly customerRepo = inject(CUSTOMER_REPOSITORY);

  readonly allCustomers = toSignal(this.customerRepo.list(), { initialValue: [] });

  // ── Filters & Sorting ─────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly sortKey     = signal<SortKey>('newest');

  readonly filteredCustomers = computed<CustomerProfile[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const sort  = this.sortKey();
    let list = [...this.allCustomers()];

    if (query) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.username.toLowerCase().includes(query) ||
          (c.phoneNumber ?? '').toLowerCase().includes(query),
      );
    }

    switch (sort) {
      case 'newest':
        return list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
      case 'most-orders':
        return list.sort((a, b) => b.orderCount - a.orderCount);
      case 'highest-spend':
        return list.sort((a, b) => b.totalSpent - a.totalSpent);
      case 'name-az':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  });

  // ── Summary Stats ─────────────────────────────────────────────────────────
  readonly summaryStats = computed(() => {
    const all = this.allCustomers();
    const withOrders  = all.filter((c) => c.orderCount > 0).length;
    const repeat      = all.filter((c) => c.orderCount >= 2).length;
    const totalSpent  = all.reduce((s, c) => s + c.totalSpent, 0);
    const avgSpend    = all.length ? Math.round(totalSpent / all.length) : 0;
    return { total: all.length, withOrders, repeat, avgSpend };
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  readonly icons = {
    Users, Search, ChevronRight, ArrowRight, RefreshCw,
    UserCheck, Repeat2, TrendingUp, Mail, Phone, ArrowUpDown,
  };

  initials   = initials;
  formatDate = formatDate;
  formatMoney = formatMoney;

  setSort(key: SortKey): void { this.sortKey.set(key); }
}
