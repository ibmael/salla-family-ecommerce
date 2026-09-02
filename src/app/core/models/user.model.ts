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
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details: string;
}
