import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BrowserStorageService } from './browser-storage.service';
import { AuditAction, AuditEntityType, AuditLog } from '../models/user.model';
import { MOCK_AUDIT_LOGS } from '../../data/mocks/orders.mock';
import { AUTH_REPOSITORY, AuditLogRepository } from '../repositories/repository.tokens';

const AUDIT_STORAGE_KEY = 'salla-audit-logs';

/**
 * AuditLogService — single write point for all admin audit events.
 *
 * Repositories call `record(...)` after each successful mutation.
 * The Audit Logs page reads via `list()`.
 *
 * In production this service would delegate to an HTTP endpoint.
 * The mock implementation persists to localStorage, seeded with
 * MOCK_AUDIT_LOGS on first load (so the page is not empty).
 */
@Injectable({ providedIn: 'root' })
export class AuditLogService implements AuditLogRepository {
  private readonly storage  = inject(BrowserStorageService);
  private readonly authRepo = inject(AUTH_REPOSITORY);

  /** Returns runtime + seed logs merged, newest-first */
  list(): Observable<AuditLog[]> {
    return of(this.read());
  }

  /**
   * Record a new audit event. Called by repositories at the right layer.
   * Components MUST NOT call this directly.
   */
  record(params: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    entityLabel?: string;
    metadata?: Record<string, string | number | boolean>;
  }): void {
    const actor = this.resolveActor();
    const entry: AuditLog = {
      id: `log-rt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityLabel: params.entityLabel,
      actorId: actor.id,
      actorName: actor.name,
      timestamp: new Date().toISOString(),
      metadata: params.metadata,
    };

    // Prepend so newest is first
    const existing = this.readRuntime();
    this.storage.write(AUDIT_STORAGE_KEY, [entry, ...existing]);
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private readRuntime(): AuditLog[] {
    return this.storage.read<AuditLog[]>(AUDIT_STORAGE_KEY, []);
  }

  private read(): AuditLog[] {
    const runtime = this.readRuntime();
    const runtimeIds = new Set(runtime.map((l) => l.id));
    const seed = MOCK_AUDIT_LOGS.filter((l) => !runtimeIds.has(l.id));
    // Runtime events first (newest), then seed history
    return [...runtime, ...seed];
  }

  /** Resolves actor from auth repository (synchronous in mock implementation) */
  private resolveActor(): { id: string; name: string } {
    let actor: { id: string; name: string } = { id: 'admin-1', name: 'Admin User' };
    // currentUser() is of() in mock — synchronous subscription
    this.authRepo.currentUser().subscribe((user) => {
      if (user) {
        actor = { id: user.id, name: user.name || user.email };
      }
    });
    return actor;
  }
}
