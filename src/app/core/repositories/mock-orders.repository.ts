import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MOCK_AUDIT_LOGS, MOCK_CUSTOMERS, MOCK_DATA_VERSION, MOCK_ORDERS } from '../../data/mocks/orders.mock';
import { MOCK_PRODUCTS } from '../../data/mocks/catalog.mock';
import { Order, OrderLine, OrderStatus, OrderStatusHistoryItem } from '../models/order.model';
import { AdminRepository, OrderRepository } from './repository.tokens';
import { AuditLog, Customer } from '../models/user.model';
import { BrowserStorageService } from '../services/browser-storage.service';

const ORDERS_STORAGE_KEY = 'salla-mock-orders';
const DATA_VERSION_KEY   = 'salla-mock-data-version';

const LIFECYCLE_ORDER: OrderStatus[] = [
  'placed', 'confirmed', 'processing', 'packed',
  'shipped', 'out_for_delivery', 'delivered',
];

const DEFAULT_MILESTONE_NOTES: Record<OrderStatus, string> = {
  placed:           'Order placed by customer',
  confirmed:        'Payment verified and order confirmed',
  processing:       'Allocated to fulfillment warehouse',
  packed:           'Items inspected and securely packed',
  shipped:          'Handed over to carrier in transit',
  out_for_delivery: 'Out for local delivery with courier',
  delivered:        'Successfully delivered to recipient',
  cancelled:        'Order cancelled',
  pending:          'Order placed by customer',
};

@Injectable({ providedIn: 'root' })
export class MockOrderRepository implements OrderRepository {
  private readonly storage = inject(BrowserStorageService);
  private orders: Order[] = this.loadOrders();

  private loadOrders(): Order[] {
    // ── Version-based migration ────────────────────────────────────────────
    const storedVersion = this.storage.read<number>(DATA_VERSION_KEY, 0);

    if (storedVersion < MOCK_DATA_VERSION) {
      // Seed version changed — reseed from MOCK_ORDERS (preserving any admin-created orders)
      const existingSaved = this.storage.read<Order[] | null>(ORDERS_STORAGE_KEY, null);
      const adminCreated  = existingSaved
        ? existingSaved.filter((o) => !MOCK_ORDERS.some((m) => m.id === o.id))
        : [];

      const initial = this.hydrateOrders([...MOCK_ORDERS, ...adminCreated]);
      this.storage.write(ORDERS_STORAGE_KEY, initial);
      this.storage.write(DATA_VERSION_KEY, MOCK_DATA_VERSION);
      return initial;
    }

    const saved = this.storage.read<Order[] | null>(ORDERS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      const migrated = this.hydrateOrders(saved);
      this.storage.write(ORDERS_STORAGE_KEY, migrated);
      return migrated;
    }

    const initial = this.hydrateOrders([...MOCK_ORDERS]);
    this.storage.write(ORDERS_STORAGE_KEY, initial);
    this.storage.write(DATA_VERSION_KEY, MOCK_DATA_VERSION);
    return initial;
  }

  private save(): void {
    this.storage.write(ORDERS_STORAGE_KEY, this.orders);
  }

  private hydrateOrders(rawOrders: Order[]): Order[] {
    return rawOrders.map((order) => {
      // Normalize legacy 'pending' status
      const status: OrderStatus = order.status === 'pending' ? 'placed' : order.status;

      let history: OrderStatusHistoryItem[] = order.statusHistory || [];
      const targetIndex = LIFECYCLE_ORDER.indexOf(status);
      const isCancelled = status === 'cancelled';
      const baseTime = new Date(order.createdAt || Date.now()).getTime();

      // Synthesize complete statusHistory if missing or too short
      if (!history.length || (!isCancelled && targetIndex > 0 && history.filter((h) => h.status !== 'cancelled').length < targetIndex + 1)) {
        history = [];
        const maxStage = isCancelled ? 1 : Math.max(targetIndex, 0);
        const hourOffsets = [0, 0.5, 2.5, 5, 24, 48, 54];
        for (let i = 0; i <= maxStage; i++) {
          const stepKey = LIFECYCLE_ORDER[i];
          const stepTime = new Date(baseTime + hourOffsets[i] * 3600 * 1000).toISOString();
          history.push({ status: stepKey, at: stepTime, note: DEFAULT_MILESTONE_NOTES[stepKey] });
        }
        if (isCancelled) {
          history.push({
            status: 'cancelled',
            at: new Date(baseTime + 4 * 3600 * 1000).toISOString(),
            note: order.cancellationReason || 'Order cancelled',
          });
        }
      }

      return {
        ...order,
        status,
        statusHistory: history,
        lines: order.lines.map((line) => this.hydrateLine(line)),
      };
    });
  }

  private hydrateLine(line: OrderLine): OrderLine {
    if (line.productImage && line.productSlug) return line;
    const product = MOCK_PRODUCTS.find((p) => p.id === line.productId);
    return {
      ...line,
      productName:  line.productName  || product?.name  || 'Curated Item',
      productImage: line.productImage || product?.image || '',
      productSlug:  line.productSlug  || product?.slug  || '',
    };
  }

  list(userId?: string): Observable<Order[]> {
    const data = userId ? this.orders.filter((o) => o.userId === userId) : this.orders;
    return of([...data]);
  }

  byId(id: string): Observable<Order | undefined> {
    const found = this.orders.find((o) => o.id === id);
    return of(found ? { ...found } : undefined);
  }

  create(order: Omit<Order, 'id' | 'createdAt'>): Observable<Order> {
    const nowIso = new Date().toISOString();
    const created: Order = {
      ...order,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: nowIso.split('T')[0],
      status: 'placed',
      statusHistory: [{ status: 'placed', at: nowIso, note: DEFAULT_MILESTONE_NOTES.placed }],
      lines: order.lines.map((l) => this.hydrateLine(l)),
    };
    this.orders = [created, ...this.orders];
    this.save();
    return of(created);
  }

  updateStatus(id: string, status: OrderStatus, note?: string): Observable<Order> {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return throwError(() => new Error(`Order #${id} not found.`));

    const currentOrder = this.orders[index];
    if (currentOrder.status === 'delivered') return throwError(() => new Error('Order is already delivered.'));
    if (currentOrder.status === 'cancelled') return throwError(() => new Error('Order is cancelled.'));

    const nowIso = new Date().toISOString();
    const existingHistory = currentOrder.statusHistory || [];
    const isConsecutiveDuplicate =
      existingHistory.length > 0 && existingHistory[existingHistory.length - 1].status === status;

    const newHistory: OrderStatusHistoryItem[] = isConsecutiveDuplicate
      ? existingHistory
      : [...existingHistory, { status, at: nowIso, note: note || DEFAULT_MILESTONE_NOTES[status] || `Updated to ${status}` }];

    const updated: Order = {
      ...currentOrder,
      status,
      statusHistory: newHistory,
      deliveredDate: status === 'delivered' ? nowIso.split('T')[0] : currentOrder.deliveredDate,
    };
    this.orders[index] = updated;
    this.save();
    return of(updated);
  }

  cancelOrder(id: string, reason = 'Cancelled by administrator'): Observable<Order> {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return throwError(() => new Error(`Order #${id} not found.`));

    const currentOrder = this.orders[index];
    if (currentOrder.status === 'shipped' || currentOrder.status === 'out_for_delivery' || currentOrder.status === 'delivered') {
      return throwError(() => new Error(`Order in ${currentOrder.status} state cannot be cancelled.`));
    }
    if (currentOrder.status === 'cancelled') return throwError(() => new Error('Already cancelled.'));

    const nowIso = new Date().toISOString();
    const updated: Order = {
      ...currentOrder,
      status: 'cancelled',
      cancelledAt: nowIso.split('T')[0],
      cancellationReason: reason,
      statusHistory: [...(currentOrder.statusHistory || []), { status: 'cancelled', at: nowIso, note: `Cancelled: ${reason}` }],
    };
    this.orders[index] = updated;
    this.save();
    return of(updated);
  }
}

@Injectable({ providedIn: 'root' })
export class MockAdminRepository implements AdminRepository {
  private readonly orderRepo = inject(MockOrderRepository);
  private readonly storage   = inject(BrowserStorageService);

  dashboardStats(): Observable<{ revenue: number; orders: number; customers: number; products: number }> {
    let revenue = 0;
    let orderCount = 0;

    this.orderRepo.list().subscribe((orders) => {
      orderCount = orders.length;
      revenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
    });

    const savedProducts = this.storage.read<any[] | null>('salla-mock-products', null);
    const productCount  = savedProducts && Array.isArray(savedProducts) ? savedProducts.length : MOCK_PRODUCTS.length;

    return of({ revenue, orders: orderCount, customers: MOCK_CUSTOMERS.length, products: productCount });
  }

  customers(): Observable<Customer[]> {
    return of(MOCK_CUSTOMERS);
  }

  auditLogs(): Observable<AuditLog[]> {
    return of(MOCK_AUDIT_LOGS);
  }
}
