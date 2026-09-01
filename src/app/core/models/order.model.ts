import { Product } from './product.model';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'pending'; // backwards-compatible alias for placed

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface OrderLine {
  productId: string;
  productName: string;
  productImage: string;
  productSlug?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  shippingAddress: string;
  recipientName?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  statusHistory?: OrderStatusHistoryItem[];
}

export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}
