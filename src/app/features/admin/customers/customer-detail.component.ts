import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { format, parseISO } from 'date-fns';
import {
  LucideAngularModule,
  Users,
  Mail,
  Phone,
  User,
  ShoppingBag,
  DollarSign,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Package,
  MapPin,
  TrendingUp,
} from 'lucide-angular';
import { CUSTOMER_REPOSITORY, CustomerProfile } from '../../../core/repositories/repository.tokens';
import { Order } from '../../../core/models/order.model';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';

interface PurchasedProduct {
  productId:    string;
  productName:  string;
  productImage: string;
  productSlug:  string;
  timesPurchased: number;
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function formatDate(iso: string | undefined, pattern: string): string {
  if (!iso) return '—';
  try { return format(parseISO(iso), pattern); } catch { return iso ?? '—'; }
}

function formatMoney(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString('en-US')}`;
}

@Component({
  selector: 'app-admin-customer-detail',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, OrderStatusBadgeComponent],
  templateUrl: './customer-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomerDetailComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly customerRepo = inject(CUSTOMER_REPOSITORY);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly customer = signal<CustomerProfile | undefined | null>(undefined); // undefined = loading, null = not found
  readonly orders   = signal<Order[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.customerRepo.byId(id).subscribe((profile) => {
      this.customer.set(profile ?? null);
    });

    this.customerRepo.ordersByCustomer(id).subscribe((customerOrders) => {
      this.orders.set(
        [...customerOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    });
  }

  // ── Derived metrics ────────────────────────────────────────────────────────

  /** Latest delivery address derived from most recent order */
  readonly latestAddress = computed(() => {
    const o = this.orders().find((ord) => ord.shippingAddress);
    return o?.shippingAddress;
  });

  /** Average order value: non-cancelled spend ÷ non-cancelled count */
  readonly avgOrderValue = computed(() => {
    const active = this.orders().filter((o) => o.status !== 'cancelled');
    if (!active.length) return 0;
    return Math.round(active.reduce((s, o) => s + o.total, 0) / active.length);
  });

  /** Frequently purchased products (top 5 by quantity, non-cancelled only) */
  readonly frequentlyPurchased = computed<PurchasedProduct[]>(() => {
    const tally = new Map<string, PurchasedProduct & { count: number }>();
    for (const o of this.orders()) {
      if (o.status === 'cancelled') continue;
      for (const line of o.lines) {
        const prev = tally.get(line.productId);
        if (prev) {
          tally.set(line.productId, { ...prev, count: prev.count + (line.quantity || 1), timesPurchased: prev.timesPurchased + (line.quantity || 1) });
        } else {
          tally.set(line.productId, {
            productId:    line.productId,
            productName:  line.productName  || 'Product',
            productImage: line.productImage || '',
            productSlug:  line.productSlug  || '',
            timesPurchased: line.quantity || 1,
            count: line.quantity || 1,
          });
        }
      }
    }
    return [...tally.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ count, ...p }) => p);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  readonly icons = {
    Users, Mail, Phone, User, ShoppingBag, DollarSign,
    Calendar, ChevronRight, ArrowLeft, Package, MapPin, TrendingUp,
  };

  initials    = initials;
  formatDate  = formatDate;
  formatMoney = formatMoney;

  getItemCount(o: Order): number {
    return o.lines.reduce((s, l) => s + (l.quantity || 1), 0);
  }
}
