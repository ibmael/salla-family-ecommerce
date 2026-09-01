import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { format } from 'date-fns';
import {
  LucideAngularModule,
  Check,
  XCircle,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-angular';
import { OrderStatus, OrderStatusHistoryItem } from '../../../core/models/order.model';

export interface ProgressStepItem {
  key: OrderStatus;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  isCancelled?: boolean;
  timestamp?: string;
  note?: string;
}

const LIFECYCLE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

@Component({
  selector: 'app-order-progress',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './order-progress.component.html',
  styleUrl: './order-progress.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderProgressComponent {
  readonly status = input.required<OrderStatus | string>();
  readonly statusHistory = input<OrderStatusHistoryItem[] | undefined>(undefined);
  readonly cancellationReason = input<string | undefined>(undefined);
  readonly cancelledAt = input<string | undefined>(undefined);

  readonly icons = {
    Check,
    XCircle,
    Clock,
    Package,
    Truck,
    CheckCircle2,
    AlertTriangle,
  };

  readonly normalizedStatus = computed<OrderStatus>(() => {
    const s = this.status()?.toLowerCase() as OrderStatus;
    return s === 'pending' ? 'placed' : s || 'placed';
  });

  readonly isCancelled = computed<boolean>(() => {
    return this.normalizedStatus() === 'cancelled';
  });

  readonly progressPercentage = computed<number>(() => {
    if (this.isCancelled()) return 0;
    const currentStatus = this.normalizedStatus();
    const index = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);
    if (index <= 0) return 0;
    return Math.min(Math.round((index / (LIFECYCLE_STEPS.length - 1)) * 100), 100);
  });

  readonly steps = computed<ProgressStepItem[]>(() => {
    const currentStatus = this.normalizedStatus();
    const history = this.statusHistory() || [];

    const getTimestamp = (key: OrderStatus): { timestamp?: string; note?: string } => {
      const match = history.find(
        (h) => h.status === key || (key === 'placed' && h.status === 'pending'),
      );
      if (!match?.at) return {};
      try {
        const formatted = format(new Date(match.at), 'MMM d · h:mm a');
        return { timestamp: formatted, note: match.note };
      } catch {
        return { timestamp: match.at, note: match.note };
      }
    };

    if (currentStatus === 'cancelled') {
      // Find history items prior to cancellation
      const activeHistoryKeys = history
        .filter((h) => h.status !== 'cancelled')
        .map((h) => (h.status === 'pending' ? 'placed' : h.status));

      const lastKnownKey = activeHistoryKeys[activeHistoryKeys.length - 1] || 'placed';
      const lastIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === lastKnownKey);

      const pastSteps: ProgressStepItem[] = LIFECYCLE_STEPS.slice(
        0,
        lastIndex >= 0 ? lastIndex + 1 : 1,
      ).map((s) => {
        const meta = getTimestamp(s.key);
        return {
          key: s.key,
          label: s.label,
          isCompleted: true,
          isCurrent: false,
          isUpcoming: false,
          timestamp: meta.timestamp,
          note: meta.note,
        };
      });

      let cancelledTime: string | undefined;
      const cancelMeta = history.find((h) => h.status === 'cancelled');
      if (cancelMeta?.at || this.cancelledAt()) {
        try {
          cancelledTime = format(
            new Date(cancelMeta?.at || this.cancelledAt()!),
            'MMM d · h:mm a',
          );
        } catch {
          cancelledTime = cancelMeta?.at || this.cancelledAt();
        }
      }

      pastSteps.push({
        key: 'cancelled',
        label: 'Order Cancelled',
        isCompleted: false,
        isCurrent: true,
        isUpcoming: false,
        isCancelled: true,
        timestamp: cancelledTime,
        note: this.cancellationReason() || cancelMeta?.note || 'Order cancelled',
      });

      return pastSteps;
    }

    const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);
    const validCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

    return LIFECYCLE_STEPS.map((step, idx) => {
      const isCompleted = idx < validCurrentIndex;
      const isCurrent = idx === validCurrentIndex;
      const isUpcoming = idx > validCurrentIndex;
      const meta = isCompleted || isCurrent ? getTimestamp(step.key) : {};

      return {
        key: step.key,
        label: step.label,
        isCompleted,
        isCurrent,
        isUpcoming,
        timestamp: meta.timestamp,
        note: meta.note,
      };
    });
  });
}
