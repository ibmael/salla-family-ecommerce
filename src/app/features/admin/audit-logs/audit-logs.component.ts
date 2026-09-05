import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatDistanceToNow, format } from 'date-fns';
import {
  LucideAngularModule,
  Search,
  X,
  ArrowUpDown,
  Filter,
  Package,
  Tag,
  ShoppingBag,
  User,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Ban,
  UserX,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Info,
  RefreshCw,
  History,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-angular';
import { AUDIT_LOG_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { AuditAction, AuditEntityType, AuditLog } from '../../../core/models/user.model';
import {
  CustomSelectComponent,
  SelectOption,
} from '../../../shared/ui/custom-select/custom-select.component';

type SortOption = 'newest' | 'oldest';
type IconData = typeof Package;

interface ActionMeta {
  label: string;
  badgeClass: string;
  icon: IconData;
}

const ACTION_META: Record<AuditAction, ActionMeta> = {
  'Product Created': {
    label: 'Product Created',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    icon: Plus,
  },
  'Product Updated': {
    label: 'Product Updated',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: Edit2,
  },
  'Product Deleted': {
    label: 'Product Deleted',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: Trash2,
  },
  'Category Created': {
    label: 'Category Created',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    icon: Plus,
  },
  'Category Updated': {
    label: 'Category Updated',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: Edit2,
  },
  'Category Deleted': {
    label: 'Category Deleted',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: Trash2,
  },
  'Order Status Changed': {
    label: 'Status Changed',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
    icon: RotateCcw,
  },
  'Order Cancelled': {
    label: 'Order Cancelled',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: Ban,
  },
  'Customer Deactivated': {
    label: 'Deactivated',
    badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
    icon: UserX,
  },
};

const ENTITY_ICON: Record<AuditEntityType, IconData> = {
  product: Package,
  category: Tag,
  order: ShoppingBag,
  customer: User,
};

const ENTITY_BADGE: Record<AuditEntityType, string> = {
  product: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  category: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  order: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  customer: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
};

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CustomSelectComponent],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogsComponent implements OnInit {
  private readonly auditRepo = inject(AUDIT_LOG_REPOSITORY);

  readonly icons = {
    Search,
    X,
    ArrowUpDown,
    Filter,
    Package,
    Tag,
    ShoppingBag,
    User,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Ban,
    UserX,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    Info,
    RefreshCw,
    History,
    AlertCircle,
    SlidersHorizontal,
  };

  readonly rawLogs = signal<AuditLog[]>([]);
  readonly loading = signal<boolean>(false);

  // ── Filters & Controls ───────────────────────────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly filterAction = signal<string>('all');
  readonly filterEntity = signal<string>('all');
  readonly sortOrder = signal<SortOption>('newest');
  readonly expandedLogId = signal<string | null>(null);

  readonly actionOptions: AuditAction[] = [
    'Product Created',
    'Product Updated',
    'Product Deleted',
    'Category Created',
    'Category Updated',
    'Category Deleted',
    'Order Status Changed',
    'Order Cancelled',
    'Customer Deactivated',
  ];

  readonly entitySelectOptions: SelectOption<string>[] = [
    { value: 'all', label: 'All entities' },
    { value: 'product', label: 'Products' },
    { value: 'category', label: 'Categories' },
    { value: 'order', label: 'Orders' },
    { value: 'customer', label: 'Customers' },
  ];

  readonly actionSelectOptions = computed<SelectOption<string>[]>(() => [
    { value: 'all', label: 'All actions' },
    ...this.actionOptions.map((act) => ({ value: act, label: act })),
  ]);

  readonly sortSelectOptions: SelectOption<SortOption>[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.auditRepo.list().subscribe({
      next: (logs) => {
        this.rawLogs.set(logs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // ── Summary KPIs ──────────────────────────────────────────────────────────
  readonly stats = computed(() => {
    const logs = this.rawLogs();
    return {
      total: logs.length,
      product: logs.filter((l) => l.entityType === 'product').length,
      order: logs.filter((l) => l.entityType === 'order').length,
      category: logs.filter((l) => l.entityType === 'category').length,
    };
  });

  // ── Derived filtered list ─────────────────────────────────────────────────
  readonly filteredLogs = computed(() => {
    let logs = [...this.rawLogs()];
    const q = this.searchQuery().trim().toLowerCase();

    if (q) {
      logs = logs.filter((l) => {
        const actionMatch = l.action.toLowerCase().includes(q);
        const entityLabelMatch = (l.entityLabel ?? l.target ?? '').toLowerCase().includes(q);
        const entityIdMatch = (l.entityId ?? '').toLowerCase().includes(q);
        const actorNameMatch = (l.actorName ?? l.actor ?? '').toLowerCase().includes(q);
        const detailsMatch = (l.details ?? '').toLowerCase().includes(q);
        const metadataMatch = l.metadata
          ? Object.entries(l.metadata).some(
              ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q),
            )
          : false;

        return (
          actionMatch ||
          entityLabelMatch ||
          entityIdMatch ||
          actorNameMatch ||
          detailsMatch ||
          metadataMatch
        );
      });
    }

    if (this.filterAction() !== 'all') {
      logs = logs.filter((l) => l.action === this.filterAction());
    }

    if (this.filterEntity() !== 'all') {
      logs = logs.filter((l) => l.entityType === this.filterEntity());
    }

    logs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return this.sortOrder() === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return logs;
  });

  readonly isFiltered = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.filterAction() !== 'all' ||
      this.filterEntity() !== 'all'
    );
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  actionMeta(log: AuditLog): ActionMeta {
    return (
      ACTION_META[log.action] ?? {
        label: log.action,
        badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
        icon: FileText,
      }
    );
  }

  entityBadgeClass(type: AuditEntityType): string {
    return (
      ENTITY_BADGE[type] ??
      'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20'
    );
  }

  entityIcon(log: AuditLog): IconData {
    return ENTITY_ICON[log.entityType] ?? FileText;
  }

  entityLabel(log: AuditLog): string {
    return log.entityLabel ?? log.target ?? log.entityId ?? '—';
  }

  actorName(log: AuditLog): string {
    return log.actorName ?? log.actor ?? 'System';
  }

  actorInitials(log: AuditLog): string {
    const name = this.actorName(log).trim();
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  metadataEntries(log: AuditLog): { key: string; value: string }[] {
    const entries: { key: string; value: string }[] = [];
    if (log.metadata) {
      for (const [key, val] of Object.entries(log.metadata)) {
        entries.push({
          key: key.replace(/_/g, ' '),
          value: String(val),
        });
      }
    }
    if (log.details && !entries.some((e) => e.key === 'details')) {
      entries.push({ key: 'details', value: log.details });
    }
    return entries;
  }

  hasDetails(log: AuditLog): boolean {
    return (
      !!(log.metadata && Object.keys(log.metadata).length > 0) ||
      !!log.details ||
      !!log.entityId ||
      !!log.actorId
    );
  }

  formatRelative(ts: string): string {
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return ts;
    }
  }

  formatAbsolute(ts: string): string {
    try {
      return format(new Date(ts), 'MMM d, yyyy · HH:mm:ss');
    } catch {
      return ts;
    }
  }

  toggleExpand(id: string): void {
    this.expandedLogId.update((current) => (current === id ? null : id));
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterAction.set('all');
    this.filterEntity.set('all');
  }
}
