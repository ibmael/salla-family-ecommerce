import { Product } from './product.model';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
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
}

export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}
