import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';
import { ADMIN_REPOSITORY } from '../../../core/repositories/repository.tokens';

@Component({
  selector: 'app-admin-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogsComponent {
  private readonly adminRepo = inject(ADMIN_REPOSITORY);
  readonly logs = toSignal(this.adminRepo.auditLogs(), { initialValue: [] });

  formatDate(value: string, pattern: string): string {
    return format(new Date(value), pattern);
  }
}
