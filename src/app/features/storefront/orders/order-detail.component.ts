import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { format } from 'date-fns';
import {
  LucideAngularModule,
  MapPin,
  CreditCard,
  Package,
  ArrowLeft,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-angular';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { MockAuthStore } from '../../../core/state/auth.store';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge/order-status-badge.component';
import { OrderProgressComponent } from '../../../shared/ui/order-progress/order-progress.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    OrderStatusBadgeComponent,
    OrderProgressComponent,
    LucideAngularModule,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  private readonly pageTitle = inject(PageTitleService);
  readonly auth = inject(MockAuthStore);

  readonly order = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('id') ?? ''),
      switchMap((id) => this.orderRepo.byId(id)),
    ),
    { initialValue: undefined },
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const ord = this.order();
    return [
      { label: 'Home', url: '/' },
      { label: 'Account', url: '/account' },
      { label: 'Orders', url: '/orders' },
      { label: ord ? `Order #${ord.id}` : 'Order Details' },
    ];
  });

  readonly icons = {
    MapPin,
    CreditCard,
    Package,
    ArrowLeft,
    ArrowRight,
    Truck,
    CheckCircle2,
    Clock,
  };

  constructor() {
    effect(() => {
      const order = this.order();
      this.pageTitle.set(order ? `Order #${order.id}` : 'Order Details');
    });
  }

  formatDate(value: string | undefined, pattern: string): string {
    if (!value) return '';
    try {
      return format(new Date(value), pattern);
    } catch {
      return value;
    }
  }
}
