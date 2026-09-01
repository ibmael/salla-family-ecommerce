import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ADMIN_REPOSITORY } from '../../../core/repositories/repository.tokens';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly adminRepo = inject(ADMIN_REPOSITORY);
  readonly stats = toSignal(this.adminRepo.dashboardStats(), {
    initialValue: { revenue: 0, orders: 0, customers: 0, products: 0 },
  });
}
