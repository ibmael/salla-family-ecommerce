import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-order-detail',
  imports: [BreadcrumbsComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  private readonly pageTitle = inject(PageTitleService);

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

  constructor() {
    effect(() => {
      const order = this.order();
      this.pageTitle.set(order ? `Order #${order.id}` : 'Order Details');
    });
  }

  formatDate(value: string, pattern: string): string {
    return format(new Date(value), pattern);
  }
}
