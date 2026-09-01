import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { MockAuthStore } from '../../../core/state/auth.store';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, BreadcrumbsComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  readonly auth = inject(MockAuthStore);
  readonly orders = toSignal(this.orderRepo.list(this.auth.user()?.id ?? 'user-1'), { initialValue: [] });

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Account', url: '/account' },
    { label: 'Orders' },
  ];

  formatDate(value: string, pattern: string): string {
    return format(new Date(value), pattern);
  }
}
