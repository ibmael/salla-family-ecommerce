import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { MockAuthStore } from '../../../core/state/auth.store';
import { format } from 'date-fns';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  readonly auth = inject(MockAuthStore);
  readonly orders = toSignal(this.orderRepo.list(this.auth.user()?.id ?? 'user-1'), { initialValue: [] });

  formatDate(value: string, pattern: string): string {
    return format(new Date(value), pattern);
  }
}
