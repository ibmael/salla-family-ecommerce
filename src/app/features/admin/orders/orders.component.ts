import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  readonly orders = toSignal(this.orderRepo.list(), { initialValue: [] });
}
