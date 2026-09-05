export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface SignUpPayload {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}


export interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface AuditLog {
  /** Stable unique ID */
  id: string;
  /** Human-readable action label, e.g. "Product Created" */
  action: AuditAction;
  /** The type of entity that was affected */
  entityType: AuditEntityType;
  /** Stable ID of the affected entity */
  entityId: string;
  /** Human-readable label of the affected entity at the time of the event */
  entityLabel?: string;
  /** Stable user ID of the actor performing the action */
  actorId: string;
  /** Display name of the actor (name or email) */
  actorName: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Optional key/value metadata, e.g. old→new price, status change */
  metadata?: Record<string, string | number | boolean>;
  // ── Legacy flat fields (used by seed data) ──
  /** @deprecated use actorName */
  actor?: string;
  /** @deprecated use entityLabel */
  target?: string;
  /** @deprecated use metadata */
  details?: string;
}

export type AuditAction =
  | 'Product Created'
  | 'Product Updated'
  | 'Product Deleted'
  | 'Category Created'
  | 'Category Updated'
  | 'Category Deleted'
  | 'Order Status Changed'
  | 'Order Cancelled'
  | 'Customer Deactivated';

export type AuditEntityType = 'product' | 'category' | 'order' | 'customer';
