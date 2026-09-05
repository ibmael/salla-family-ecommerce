import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';
import {
  LucideAngularModule,
  ShoppingBag,
  Package,
  ArrowRight,
  ChevronRight,
} from 'lucide-angular';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { MockAuthStore } from '../../../core/state/auth.store';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders',
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    OrderStatusBadgeComponent,
    LucideAngularModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  readonly auth = inject(MockAuthStore);
  readonly orders = toSignal(
    this.orderRepo.list(this.auth.user()?.id ?? 'user-1'),
    { initialValue: [] },
  );

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Account', url: '/account' },
    { label: 'Orders' },
  ];

  readonly icons = {
    ShoppingBag,
    Package,
    ArrowRight,
    ChevronRight,
  };

  formatDate(value: string | undefined, pattern: string): string {
    if (!value) return '';
    try {
      return format(new Date(value), pattern);
    } catch {
      return value;
    }
  }

  getTotalItemCount(order: Order): number {
    return order.lines.reduce((sum, line) => sum + (line.quantity || 1), 0);
  }
}
