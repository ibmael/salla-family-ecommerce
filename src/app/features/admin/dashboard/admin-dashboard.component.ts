import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import {
  LucideAngularModule,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  Store,
  ChevronRight,
  Tags,
  Activity,
  Star,
  Minus,
} from 'lucide-angular';
import {
  ADMIN_REPOSITORY,
  ORDER_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../core/repositories/repository.tokens';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';
import { MOCK_AUDIT_LOGS } from '../../../data/mocks/orders.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartPeriod = 7 | 30;

interface SalesBar {
  label:         string;
  shortLabel:    string;
  amount:        number;
  heightPercent: number;
  orderCount:    number;
  isToday:       boolean;
  isPeak:        boolean;
}

interface KpiChange {
  value:     number;   // absolute % change, positive = up
  direction: 'up' | 'down' | 'neutral';
  label:     string;
}

interface TopProductEntry {
  product:     Product;
  unitsSold:   number;
  revenue:     number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${n.toLocaleString('en-US')}`;
}

function dateKey(iso: string): string {
  return iso.split('T')[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, OrderStatusBadgeComponent, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl:    './admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly adminRepo   = inject(ADMIN_REPOSITORY);
  private readonly orderRepo   = inject(ORDER_REPOSITORY);
  private readonly productRepo = inject(PRODUCT_REPOSITORY);

  // ── raw data signals ──────────────────────────────────────────────────────
  readonly stats     = toSignal(this.adminRepo.dashboardStats(), {
    initialValue: { revenue: 0, orders: 0, customers: 0, products: 0 },
  });
  readonly rawOrders = toSignal(this.orderRepo.list(), { initialValue: [] });
  readonly productList = toSignal(this.productRepo.list({ pageSize: 100 }), {
    initialValue: { items: [], total: 0, page: 1, pageSize: 100, totalPages: 1 },
  });

  // ── chart period selector ─────────────────────────────────────────────────
  readonly selectedPeriod = signal<ChartPeriod>(7);

  selectPeriod(p: ChartPeriod): void {
    this.selectedPeriod.set(p);
  }

  // ── today reference ───────────────────────────────────────────────────────
  private readonly today = startOfDay(new Date());
  readonly todayKey = dateKey(new Date().toISOString());

  // ── build date-bucketed revenue for ANY period ─────────────────────────────
  private bucketsByDay(orders: Order[], days: number): Map<string, { total: number; count: number }> {
    const map = new Map<string, { total: number; count: number }>();
    const startTs = startOfDay(subDays(this.today, days - 1)).getTime();
    const endTs   = endOfDay(this.today).getTime();

    // Initialise every day slot with 0
    for (let d = 0; d < days; d++) {
      const key = format(subDays(this.today, days - 1 - d), 'yyyy-MM-dd');
      map.set(key, { total: 0, count: 0 });
    }

    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      try {
        const ts = parseISO(o.createdAt).getTime();
        if (ts < startTs || ts > endTs) continue;
        const key = format(parseISO(o.createdAt), 'yyyy-MM-dd');
        const existing = map.get(key) ?? { total: 0, count: 0 };
        map.set(key, { total: existing.total + o.total, count: existing.count + 1 });
      } catch { /* skip malformed dates */ }
    }
    return map;
  }

  // ── current period bars ──────────────────────────────────────────────────
  readonly salesData = computed<SalesBar[]>(() => {
    const days    = this.selectedPeriod();
    const orders  = this.rawOrders();
    const buckets = this.bucketsByDay(orders, days);
    const entries = Array.from(buckets.entries()); // already sorted chronologically
    const maxAmt  = Math.max(...entries.map(([, v]) => v.total), 1);
    const peakKey = entries.reduce((best, cur) => cur[1].total > (best?.[1]?.total ?? 0) ? cur : best, entries[0])?.[0];

    return entries.map(([key, data]) => {
      const label      = days <= 7
        ? format(parseISO(key), 'EEE, MMM d')
        : format(parseISO(key), 'MMM d');
      const shortLabel = days <= 7
        ? format(parseISO(key), 'EEE')
        : format(parseISO(key), 'MMM d');

      return {
        label,
        shortLabel,
        amount:        data.total,
        heightPercent: Math.max(Math.round((data.total / maxAmt) * 100), data.total > 0 ? 6 : 2),
        orderCount:    data.count,
        isToday:       key === this.todayKey,
        isPeak:        key === peakKey && data.total > 0,
      };
    });
  });

  // ── Y-axis scale ticks ───────────────────────────────────────────────────
  readonly yAxisTicks = computed<string[]>(() => {
    const max = Math.max(...this.salesData().map((b) => b.amount), 1);
    // 5 tick marks 0..max
    return Array.from({ length: 5 }, (_, i) => {
      const val = Math.round((max / 4) * (4 - i));
      return formatMoney(val);
    });
  });

  // ── period revenue totals for summary + KPI change ────────────────────────
  readonly periodSummary = computed<{
    currentRevenue: number;
    currentOrders:  number;
    prevRevenue:    number;
    prevOrders:     number;
    change:         KpiChange;
  }>(() => {
    const days   = this.selectedPeriod();
    const orders = this.rawOrders();

    const toRevenue = (o: Order[]) =>
      o.filter((x) => x.status !== 'cancelled').reduce((s, x) => s + x.total, 0);
    const toCount = (o: Order[]) => o.filter((x) => x.status !== 'cancelled').length;

    const curStart = subDays(this.today, days - 1).getTime();
    const curEnd   = endOfDay(this.today).getTime();
    const prevStart = subDays(this.today, days * 2 - 1).getTime();
    const prevEnd   = subDays(this.today, days).getTime() + 86399999;

    const inRange = (o: Order, s: number, e: number) => {
      try { const t = parseISO(o.createdAt).getTime(); return t >= s && t <= e; }
      catch { return false; }
    };

    const curOrders  = orders.filter((o) => inRange(o, curStart, curEnd));
    const prevOrders = orders.filter((o) => inRange(o, prevStart, prevEnd));

    const currentRevenue = toRevenue(curOrders);
    const currentOrders  = toCount(curOrders);
    const prevRevenue    = toRevenue(prevOrders);
    const prevOrders2    = toCount(prevOrders);

    let change: KpiChange;
    if (prevRevenue === 0) {
      change = currentRevenue > 0
        ? { value: 100, direction: 'up',     label: 'New this period' }
        : { value: 0,   direction: 'neutral', label: 'No prior period data' };
    } else {
      const pct = Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100);
      change = {
        value:     Math.abs(pct),
        direction: pct >= 0 ? 'up' : 'down',
        label:     `vs prev ${days} days`,
      };
    }

    return { currentRevenue, currentOrders, prevRevenue, prevOrders: prevOrders2, change };
  });

  // ── Recent orders (latest 5) ──────────────────────────────────────────────
  readonly recentOrders = computed<Order[]>(() =>
    [...this.rawOrders()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );

  // ── Top products by units sold from orders ────────────────────────────────
  readonly topProducts = computed<TopProductEntry[]>(() => {
    const orders   = this.rawOrders();
    const products = this.productList().items;

    // Tally units + revenue per product ID across all non-cancelled orders
    const tally = new Map<string, { units: number; revenue: number }>();
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const line of o.lines) {
        const prev = tally.get(line.productId) ?? { units: 0, revenue: 0 };
        tally.set(line.productId, {
          units:   prev.units   + (line.quantity || 1),
          revenue: prev.revenue + line.price * (line.quantity || 1),
        });
      }
    }

    // Build ranked list from known products
    const ranked: TopProductEntry[] = products
      .filter((p) => tally.has(p.id))
      .map((p) => ({
        product:   p,
        unitsSold: tally.get(p.id)!.units,
        revenue:   tally.get(p.id)!.revenue,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Fallback: if not enough order data, pad with featured products
    if (ranked.length < 4) {
      const usedIds = new Set(ranked.map((r) => r.product.id));
      const fallback = products
        .filter((p) => !usedIds.has(p.id) && (p.featured || p.trending))
        .slice(0, 5 - ranked.length)
        .map((p) => ({ product: p, unitsSold: 0, revenue: 0 }));
      ranked.push(...fallback);
    }

    return ranked.slice(0, 5);
  });

  // ── Recent activity from audit logs ──────────────────────────────────────
  readonly recentActivity = MOCK_AUDIT_LOGS.slice(0, 5);

  // ── Formatting helpers ────────────────────────────────────────────────────
  readonly icons = {
    DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown,
    ArrowRight, ArrowUpRight, Store, ChevronRight, Tags, Activity, Star, Minus,
  };

  formatDate(value: string | undefined, pattern: string): string {
    if (!value) return '';
    try { return format(parseISO(value), pattern); } catch { return value ?? ''; }
  }

  formatMoney = formatMoney;

  getOrderCustomer(order: Order): string {
    return order.recipientName || 'Guest';
  }

  formatActivity(action: string): { color: string; bg: string } {
    if (action.toLowerCase().includes('cancel'))  return { color: 'text-red-600',        bg: 'bg-red-500/10' };
    if (action.toLowerCase().includes('create'))  return { color: 'text-moss',            bg: 'bg-moss/10' };
    if (action.toLowerCase().includes('ship') || action.toLowerCase().includes('status')) {
      return { color: 'text-clay', bg: 'bg-clay/10' };
    }
    return { color: 'text-stone', bg: 'bg-sand/60' };
  }
}
