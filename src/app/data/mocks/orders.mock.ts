import { Order } from '../../core/models/order.model';
import { AuditLog, Customer } from '../../core/models/user.model';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001', userId: 'user-1', status: 'delivered', subtotal: 267, shipping: 0, total: 267,
    createdAt: '2026-08-20', shippingAddress: '123 Market St, San Francisco, CA',
    lines: [
      { productId: 'p-1', productName: 'Linen Blazer', productImage: '', price: 189, quantity: 1, size: 'M', color: 'Sand' },
      { productId: 'p-6', productName: 'Silk Scarf', productImage: '', price: 65, quantity: 1, size: 'One Size', color: 'Ivory' },
    ],
  },
  {
    id: 'ord-1002', userId: 'user-1', status: 'shipped', subtotal: 98, shipping: 8, total: 106,
    createdAt: '2026-08-28', shippingAddress: '123 Market St, San Francisco, CA',
    lines: [
      { productId: 'p-3', productName: 'Merino Crew Sweater', productImage: '', price: 98, quantity: 1, size: 'L', color: 'Navy' },
    ],
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Sarah Mitchell', email: 'sarah@example.com', ordersCount: 5, totalSpent: 892, joinedAt: '2025-11-10', status: 'active' },
  { id: 'cust-2', name: 'James Liu', email: 'james@example.com', ordersCount: 3, totalSpent: 445, joinedAt: '2026-01-22', status: 'active' },
  { id: 'cust-3', name: 'Emma Klein', email: 'emma@example.com', ordersCount: 8, totalSpent: 1240, joinedAt: '2025-06-05', status: 'active' },
  { id: 'cust-4', name: 'Omar Hassan', email: 'omar@example.com', ordersCount: 1, totalSpent: 72, joinedAt: '2026-07-18', status: 'inactive' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'Product Updated', actor: 'admin@salla.studio', target: 'Linen Blazer', timestamp: '2026-08-30T14:22:00Z', details: 'Price changed from $240 to $189' },
  { id: 'log-2', action: 'Order Status Changed', actor: 'admin@salla.studio', target: 'ord-1002', timestamp: '2026-08-29T09:15:00Z', details: 'Status changed to shipped' },
  { id: 'log-3', action: 'Customer Deactivated', actor: 'admin@salla.studio', target: 'omar@example.com', timestamp: '2026-08-25T16:40:00Z', details: 'Account marked inactive' },
];
