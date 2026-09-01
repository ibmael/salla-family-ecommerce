import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { format } from 'date-fns';
import {
  LucideAngularModule,
  ArrowLeft,
  MapPin,
  CreditCard,
  User,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Truck,
  RotateCcw,
  X,
  ChevronRight,
  Send,
} from 'lucide-angular';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';
import { OrderProgressComponent } from '../../../shared/ui/order-progress/order-progress.component';
import { ToastService } from '../../../core/services/toast.service';

interface NextAction {
  targetStatus: OrderStatus;
  label: string;
  note: string;
}

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    OrderStatusBadgeComponent,
    OrderProgressComponent,
    LucideAngularModule,
  ],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  private readonly toast = inject(ToastService);

  readonly isCancelModalOpen = signal<boolean>(false);
  readonly cancellationReason = signal<string>('Customer requested cancellation');

  /** Writable signal — updated directly after each status mutation for immediate reactivity */
  readonly order = signal<Order | undefined>(undefined);

  private currentOrderId = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((p) => p.get('id') ?? ''),
      switchMap((id) => {
        this.currentOrderId = id;
        return this.orderRepo.byId(id);
      }),
    ).subscribe((o) => this.order.set(o));
  }

  readonly canCancel = computed<boolean>(() => {
    const o = this.order();
    if (!o) return false;
    return (
      o.status === 'placed' ||
      o.status === 'pending' ||
      o.status === 'confirmed' ||
      o.status === 'processing' ||
      o.status === 'packed'
    );
  });

  readonly isTerminal = computed<boolean>(() => {
    const o = this.order();
    if (!o) return true;
    return o.status === 'delivered' || o.status === 'cancelled';
  });

  readonly nextAction = computed<NextAction | null>(() => {
    const o = this.order();
    if (!o) return null;

    switch (o.status) {
      case 'placed':
      case 'pending':
        return {
          targetStatus: 'confirmed',
          label: 'Confirm order',
          note: 'Payment verified and order confirmed',
        };
      case 'confirmed':
        return {
          targetStatus: 'processing',
          label: 'Send to fulfillment',
          note: 'Allocated to fulfillment warehouse',
        };
      case 'processing':
        return {
          targetStatus: 'packed',
          label: 'Mark as Packed',
          note: 'Items inspected and packed',
        };
      case 'packed':
        return {
          targetStatus: 'shipped',
          label: 'Mark as Shipped',
          note: 'Handed over to delivery carrier',
        };
      case 'shipped':
        return {
          targetStatus: 'out_for_delivery',
          label: 'Out for delivery',
          note: 'With courier for final mile delivery',
        };
      case 'out_for_delivery':
        return {
          targetStatus: 'delivered',
          label: 'Mark as Delivered',
          note: 'Successfully delivered to customer',
        };
      default:
        return null;
    }
  });

  readonly icons = {
    ArrowLeft,
    MapPin,
    CreditCard,
    User,
    Package,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Truck,
    RotateCcw,
    X,
    ChevronRight,
    Send,
  };

  formatDate(value: string | undefined, pattern: string): string {
    if (!value) return '';
    try {
      return format(new Date(value), pattern);
    } catch {
      return value;
    }
  }

  advanceStatus(): void {
    const o = this.order();
    const action = this.nextAction();
    if (!o || !action) return;

    this.orderRepo.updateStatus(o.id, action.targetStatus, action.note).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.toast.success(
          `Order advanced to "${action.label}"`,
          'Status Updated',
        );
      },
      error: (err) => {
        this.toast.error(err.message || 'Failed to update order status.', 'Error');
      },
    });
  }

  openCancelModal(): void {
    this.cancellationReason.set('Customer requested cancellation');
    this.isCancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    this.isCancelModalOpen.set(false);
  }

  confirmCancellation(): void {
    const o = this.order();
    if (!o) return;

    const reason = this.cancellationReason();
    this.orderRepo.cancelOrder(o.id, reason).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.toast.success(`Order #${o.id} has been cancelled.`, 'Order Cancelled');
        this.closeCancelModal();
      },
      error: (err) => {
        this.toast.error(err.message || 'Failed to cancel order.', 'Error');
      },
    });
  }
}
