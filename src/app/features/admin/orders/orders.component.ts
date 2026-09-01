import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';
import {
  LucideAngularModule,
  Search,
  ArrowRight,
  ShoppingBag,
  Filter,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-angular';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';

type SortOption = 'newest' | 'oldest' | 'total-desc' | 'total-asc';
type QuickTab = 'all' | 'active' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, OrderStatusBadgeComponent, LucideAngularModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private readonly orderRepo = inject(ORDER_REPOSITORY);

  readonly searchQuery = signal<string>('');
  readonly selectedTab = signal<QuickTab>('all');
  readonly specificStatus = signal<string>('all');
  readonly selectedSort = signal<SortOption>('newest');

  readonly rawOrders = toSignal(this.orderRepo.list(), { initialValue: [] });

  readonly tabCounts = computed(() => {
    const orders = this.rawOrders();
    const active = orders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled',
    );
    const delivered = orders.filter((o) => o.status === 'delivered');
    const cancelled = orders.filter((o) => o.status === 'cancelled');

    return {
      all: orders.length,
      active: active.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
    };
  });

  readonly filteredOrders = computed<Order[]>(() => {
    let list = [...this.rawOrders()];
    const query = this.searchQuery().trim().toLowerCase();
    const tab = this.selectedTab();
    const specific = this.specificStatus();
    const sort = this.selectedSort();

    // 1. Filter by Quick Tab
    if (tab === 'active') {
      list = list.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
    } else if (tab === 'delivered') {
      list = list.filter((o) => o.status === 'delivered');
    } else if (tab === 'cancelled') {
      list = list.filter((o) => o.status === 'cancelled');
    }

    // 2. Filter by Specific Status if chosen
    if (specific !== 'all') {
      list = list.filter((o) => o.status === specific);
    }

    // 3. Filter by Search Query
    if (query) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          (o.recipientName && o.recipientName.toLowerCase().includes(query)) ||
          (o.shippingAddress && o.shippingAddress.toLowerCase().includes(query)) ||
          o.lines.some((l) => l.productName.toLowerCase().includes(query)),
      );
    }

    // 4. Sort
    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'total-desc':
        list.sort((a, b) => b.total - a.total);
        break;
      case 'total-asc':
        list.sort((a, b) => a.total - b.total);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return list;
  });

  readonly icons = {
    Search,
    ArrowRight,
    ShoppingBag,
    Filter,
    ArrowUpDown,
    ChevronDown,
  };

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setTab(tab: QuickTab): void {
    this.selectedTab.set(tab);
    this.specificStatus.set('all'); // reset specific when switching tab
  }

  setSpecificStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.specificStatus.set(select.value);
  }

  setSort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSort.set(select.value as SortOption);
  }

  formatDate(value: string | undefined, pattern: string): string {
    if (!value) return '';
    try {
      return format(new Date(value), pattern);
    } catch {
      return value;
    }
  }

  getCustomerName(order: Order): string {
    return order.recipientName || 'Sarah Mitchell';
  }

  getItemCount(order: Order): number {
    return order.lines.reduce((acc, line) => acc + (line.quantity || 1), 0);
  }
}
