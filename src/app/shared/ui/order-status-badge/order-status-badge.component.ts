import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide select-none"
      [class]="badgeClasses()"
      role="status"
    >
      <span class="size-1.5 rounded-full" [class]="dotClasses()"></span>
      <span>{{ label() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus | string>();

  readonly normalizedStatus = computed<OrderStatus>(() => {
    const s = this.status()?.toLowerCase() as OrderStatus;
    return s || 'placed';
  });

  readonly label = computed<string>(() => {
    switch (this.normalizedStatus()) {
      case 'placed':
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'packed':
        return 'Packed';
      case 'shipped':
        return 'Shipped';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return this.normalizedStatus();
    }
  });

  readonly badgeClasses = computed<string>(() => {
    switch (this.normalizedStatus()) {
      case 'delivered':
        return 'bg-moss/10 text-moss border border-moss/25 dark:bg-moss/25 dark:text-[#88a58d] dark:border-moss/40';
      case 'out_for_delivery':
      case 'shipped':
        return 'bg-clay/10 text-clay border border-clay/25 dark:bg-clay/20 dark:text-[#df8c6d] dark:border-clay/35';
      case 'packed':
      case 'processing':
        return 'bg-amber-500/10 text-amber-800 border border-amber-500/25 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-800 border border-blue-500/25 dark:bg-blue-400/15 dark:text-blue-300 dark:border-blue-400/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30';
      case 'placed':
      case 'pending':
      default:
        return 'bg-sand/60 text-ink/80 border border-black/10 dark:bg-white/10 dark:text-sand dark:border-white/15';
    }
  });

  readonly dotClasses = computed<string>(() => {
    switch (this.normalizedStatus()) {
      case 'delivered':
        return 'bg-moss dark:bg-[#88a58d]';
      case 'out_for_delivery':
      case 'shipped':
        return 'bg-clay dark:bg-[#df8c6d]';
      case 'packed':
      case 'processing':
        return 'bg-amber-600 dark:bg-amber-400';
      case 'confirmed':
        return 'bg-blue-600 dark:bg-blue-400';
      case 'cancelled':
        return 'bg-red-600 dark:bg-red-400';
      case 'placed':
      case 'pending':
      default:
        return 'bg-stone dark:bg-sand';
    }
  });
}
