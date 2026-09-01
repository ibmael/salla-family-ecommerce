import { ASSETS } from '../../core/constants/assets';
import { Order } from '../../core/models/order.model';
import { AuditLog, Customer } from '../../core/models/user.model';

// ─────────────────────────────────────────────────────────────────────────────
// DATA VERSION — bump this number whenever MOCK_ORDERS or MOCK_CUSTOMERS change
// The repository will auto-reseed localStorage if stored version is older.
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_DATA_VERSION = 3;

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS (10 accounts)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Sarah Mitchell', email: 'sarah@example.com', ordersCount: 7, totalSpent: 1892, joinedAt: '2025-11-10', status: 'active' },
  { id: 'cust-2', name: 'James Liu', email: 'james@example.com', ordersCount: 5, totalSpent: 745, joinedAt: '2026-01-22', status: 'active' },
  { id: 'cust-3', name: 'Emma Klein', email: 'emma@example.com', ordersCount: 9, totalSpent: 2140, joinedAt: '2025-06-05', status: 'active' },
  { id: 'cust-4', name: 'Omar Hassan', email: 'omar@example.com', ordersCount: 2, totalSpent: 172, joinedAt: '2026-07-18', status: 'active' },
  { id: 'cust-5', name: 'Lena Bauer', email: 'lena@example.com', ordersCount: 4, totalSpent: 628, joinedAt: '2026-03-02', status: 'active' },
  { id: 'cust-6', name: 'Kai Tanaka', email: 'kai@example.com', ordersCount: 3, totalSpent: 449, joinedAt: '2026-04-15', status: 'active' },
  { id: 'cust-7', name: 'Priya Sharma', email: 'priya@example.com', ordersCount: 6, totalSpent: 1110, joinedAt: '2025-12-20', status: 'active' },
  { id: 'cust-8', name: 'Lucas Ferreira', email: 'lucas@example.com', ordersCount: 2, totalSpent: 290, joinedAt: '2026-05-11', status: 'active' },
  { id: 'cust-9', name: 'Amara Osei', email: 'amara@example.com', ordersCount: 3, totalSpent: 534, joinedAt: '2026-06-07', status: 'active' },
  { id: 'cust-10', name: 'Nora Andersen', email: 'nora@example.com', ordersCount: 1, totalSpent: 98, joinedAt: '2026-08-19', status: 'inactive' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS (25 orders distributed across ~last 30 days)
// All dates relative to reference: 2026-09-01 (current session date)
// Statuses distributed realistically: more delivered/shipped, fewer cancelled
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [

  // ── DELIVERED ──────────────────────────────────────────────────────────────

  {
    id: 'ord-1001',
    userId: 'user-1',
    status: 'delivered',
    subtotal: 254, shipping: 0, total: 254,
    createdAt: '2026-08-03',
    deliveredDate: '2026-08-07',
    shippingAddress: '123 Market St, Apt 4B, San Francisco, CA 94103, US',
    recipientName: 'Sarah Mitchell', phoneNumber: '+1 (555) 234-5678',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-03T09:00:00Z', note: 'Order placed by customer' },
      { status: 'confirmed',        at: '2026-08-03T09:30:00Z', note: 'Payment verified' },
      { status: 'processing',       at: '2026-08-03T11:00:00Z', note: 'Sent to fulfillment' },
      { status: 'packed',           at: '2026-08-04T08:00:00Z', note: 'Items packed' },
      { status: 'shipped',          at: '2026-08-04T16:00:00Z', note: 'Shipped via FedEx' },
      { status: 'out_for_delivery', at: '2026-08-07T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-07T14:30:00Z', note: 'Delivered at front door' },
    ],
    lines: [
      { productId: 'p-1', productName: 'Linen Blazer', productSlug: 'linen-blazer', productImage: ASSETS.categories.apparel, price: 189, quantity: 1, size: 'M', color: 'Sand' },
      { productId: 'p-6', productName: 'Silk Scarf', productSlug: 'silk-scarf', productImage: ASSETS.categories.beauty, price: 65, quantity: 1, size: 'One Size', color: 'Ivory' },
    ],
  },

  {
    id: 'ord-1002',
    userId: 'user-1',
    status: 'delivered',
    subtotal: 220, shipping: 0, total: 220,
    createdAt: '2026-08-06',
    deliveredDate: '2026-08-10',
    shippingAddress: '123 Market St, Apt 4B, San Francisco, CA 94103, US',
    recipientName: 'Sarah Mitchell', phoneNumber: '+1 (555) 234-5678',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-06T14:00:00Z', note: 'Order placed by customer' },
      { status: 'confirmed',        at: '2026-08-06T14:20:00Z', note: 'Payment verified' },
      { status: 'processing',       at: '2026-08-07T09:00:00Z', note: 'Fulfillment assigned' },
      { status: 'packed',           at: '2026-08-08T10:00:00Z', note: 'Items packed' },
      { status: 'shipped',          at: '2026-08-08T16:00:00Z', note: 'Shipped via DHL' },
      { status: 'out_for_delivery', at: '2026-08-10T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-10T13:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-5', productName: 'Leather Tote', productSlug: 'leather-tote', productImage: ASSETS.categories.tech, price: 220, quantity: 1, size: 'One Size', color: 'Cognac' },
    ],
  },

  {
    id: 'ord-1003',
    userId: 'cust-3',
    status: 'delivered',
    subtotal: 362, shipping: 0, total: 362,
    createdAt: '2026-08-09',
    deliveredDate: '2026-08-14',
    shippingAddress: '88 Charlottenburg, Berlin, Germany',
    recipientName: 'Emma Klein', phoneNumber: '+49 30 555 0123',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-09T10:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-09T10:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-10T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-11T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-11T16:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-14T07:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-14T12:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-2', productName: 'Cashmere Wrap', productSlug: 'cashmere-wrap', productImage: ASSETS.categories.beauty, price: 145, quantity: 1, size: 'One Size', color: 'Cream' },
      { productId: 'p-11', productName: 'Minimal Watch', productSlug: 'minimal-watch', productImage: ASSETS.categories.tech, price: 217, quantity: 1, size: 'One Size', color: 'Silver' },
    ],
  },

  {
    id: 'ord-1004',
    userId: 'cust-2',
    status: 'delivered',
    subtotal: 198, shipping: 12, total: 210,
    createdAt: '2026-08-11',
    deliveredDate: '2026-08-16',
    shippingAddress: '14 Lombard Street, London, UK',
    recipientName: 'James Liu', phoneNumber: '+44 207 555 0198',
    paymentMethod: 'Cash on Delivery',
    statusHistory: [
      { status: 'placed',           at: '2026-08-11T11:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-11T11:15:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-12T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-13T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-13T15:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-16T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-16T11:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-12', productName: 'Linen Sheet Set', productSlug: 'linen-sheet-set', productImage: ASSETS.categories.home, price: 198, quantity: 1, size: 'Queen', color: 'Natural' },
    ],
  },

  {
    id: 'ord-1005',
    userId: 'cust-5',
    status: 'delivered',
    subtotal: 270, shipping: 0, total: 270,
    createdAt: '2026-08-13',
    deliveredDate: '2026-08-18',
    shippingAddress: '9 Maximilianstr, Munich, Germany',
    recipientName: 'Lena Bauer', phoneNumber: '+49 89 555 0177',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-13T09:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-13T09:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-14T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-15T10:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-15T16:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-18T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-18T14:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-9', productName: 'Satin Midi Dress', productSlug: 'satin-midi', productImage: ASSETS.categories.apparel, price: 165, quantity: 1, size: 'S', color: 'Champagne' },
      { productId: 'p-17', productName: 'Amber & Cedar Candle', productSlug: 'scented-soy-candle', productImage: ASSETS.categories.beauty, price: 42, quantity: 1, size: '8 oz', color: 'Amber & Cedar' },
      { productId: 'p-18', productName: 'Rose Quartz Gua Sha', productSlug: 'gua-sha-sculpting-tool', productImage: ASSETS.categories.beauty, price: 32, quantity: 1, size: 'One Size', color: 'Rose Quartz' },
      { productId: 'p-16', productName: 'Mineral Soak Bath Salts', productSlug: 'mineral-bath-salts', productImage: ASSETS.categories.beauty, price: 36, quantity: 1, size: '500g', color: 'Lavender Dusk' },
    ],
  },

  {
    id: 'ord-1006',
    userId: 'cust-7',
    status: 'delivered',
    subtotal: 416, shipping: 0, total: 416,
    createdAt: '2026-08-15',
    deliveredDate: '2026-08-20',
    shippingAddress: '22 Colaba Causeway, Mumbai, India',
    recipientName: 'Priya Sharma', phoneNumber: '+91 22 555 0199',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-15T07:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-15T07:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-16T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-17T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-17T16:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-20T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-20T15:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-13', productName: 'Structured Cotton Trench', productSlug: 'cotton-trench-coat', productImage: ASSETS.categories.apparel, price: 260, quantity: 1, size: 'M', color: 'Camel' },
      { productId: 'p-19', productName: 'Seamless Studio Legging', productSlug: 'seamless-active-legging', productImage: ASSETS.categories.sport, price: 84, quantity: 1, size: 'S', color: 'Olive' },
      { productId: 'p-16', productName: 'Mineral Soak Bath Salts', productSlug: 'mineral-bath-salts', productImage: ASSETS.categories.beauty, price: 36, quantity: 2, size: '500g', color: 'Eucalyptus Morning' },
    ],
  },

  {
    id: 'ord-1007',
    userId: 'cust-3',
    status: 'delivered',
    subtotal: 168, shipping: 8, total: 176,
    createdAt: '2026-08-17',
    deliveredDate: '2026-08-22',
    shippingAddress: '88 Charlottenburg, Berlin, Germany',
    recipientName: 'Emma Klein', phoneNumber: '+49 30 555 0123',
    paymentMethod: 'Cash on Delivery',
    statusHistory: [
      { status: 'placed',           at: '2026-08-17T13:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-17T13:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-18T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-19T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-19T15:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-22T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-22T13:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-4', productName: 'Tailored Chino', productSlug: 'tailored-chino', productImage: ASSETS.categories.apparel, price: 78, quantity: 1, size: '32', color: 'Khaki' },
      { productId: 'p-8', productName: 'Wool Throw Blanket', productSlug: 'wool-throw', productImage: ASSETS.hero, price: 90, quantity: 1, size: 'One Size', color: 'Oat' },
    ],
  },

  {
    id: 'ord-1008',
    userId: 'cust-9',
    status: 'delivered',
    subtotal: 326, shipping: 0, total: 326,
    createdAt: '2026-08-19',
    deliveredDate: '2026-08-24',
    shippingAddress: '15 Cantonments Rd, Accra, Ghana',
    recipientName: 'Amara Osei', phoneNumber: '+233 30 555 0122',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-19T09:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-19T09:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-20T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-21T10:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-21T16:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-24T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-24T14:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-25', productName: 'Artisan Dinnerware Set', productSlug: 'stoneware-dinnerware-set', productImage: ASSETS.categories.home, price: 210, quantity: 1, size: '16-Piece Service for 4', color: 'Warm Oatmeal' },
      { productId: 'p-15', productName: 'Botanical Face Oil', productSlug: 'botanical-face-oil', productImage: ASSETS.categories.beauty, price: 58, quantity: 1, size: '50ml', color: 'Original 30ml' },
      { productId: 'p-17', productName: 'Amber & Cedar Candle', productSlug: 'scented-soy-candle', productImage: ASSETS.categories.beauty, price: 42, quantity: 1, size: '8 oz', color: 'Smoked Fig' },
      { productId: 'p-18', productName: 'Rose Quartz Gua Sha', productSlug: 'gua-sha-sculpting-tool', productImage: ASSETS.categories.beauty, price: 32, quantity: 1, size: 'One Size', color: 'Rose Quartz' },
    ],
  },

  {
    id: 'ord-1009',
    userId: 'cust-6',
    status: 'delivered',
    subtotal: 295, shipping: 0, total: 295,
    createdAt: '2026-08-21',
    deliveredDate: '2026-08-26',
    shippingAddress: '3-5-1 Nishi-Shinjuku, Tokyo, Japan',
    recipientName: 'Kai Tanaka', phoneNumber: '+81 3 555 0188',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-21T02:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-21T02:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-22T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-23T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-23T16:00:00Z', note: 'Shipped via DHL' },
      { status: 'out_for_delivery', at: '2026-08-26T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-26T13:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-11', productName: 'Minimal Watch', productSlug: 'minimal-watch', productImage: ASSETS.categories.tech, price: 295, quantity: 1, size: 'One Size', color: 'Silver' },
    ],
  },

  {
    id: 'ord-1010',
    userId: 'cust-1',
    status: 'delivered',
    subtotal: 462, shipping: 0, total: 462,
    createdAt: '2026-08-23',
    deliveredDate: '2026-08-27',
    shippingAddress: '123 Market St, Apt 4B, San Francisco, CA 94103, US',
    recipientName: 'Sarah Mitchell', phoneNumber: '+1 (555) 234-5678',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-23T16:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-23T16:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-24T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-25T09:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-25T15:00:00Z', note: 'Shipped' },
      { status: 'out_for_delivery', at: '2026-08-27T08:00:00Z', note: 'Out for delivery' },
      { status: 'delivered',        at: '2026-08-27T11:00:00Z', note: 'Delivered' },
    ],
    lines: [
      { productId: 'p-5', productName: 'Leather Tote', productSlug: 'leather-tote', productImage: ASSETS.categories.tech, price: 220, quantity: 1, size: 'One Size', color: 'Black' },
      { productId: 'p-2', productName: 'Cashmere Wrap', productSlug: 'cashmere-wrap', productImage: ASSETS.categories.beauty, price: 145, quantity: 1, size: 'One Size', color: 'Charcoal' },
      { productId: 'p-18', productName: 'Rose Quartz Gua Sha', productSlug: 'gua-sha-sculpting-tool', productImage: ASSETS.categories.beauty, price: 32, quantity: 1, size: 'One Size', color: 'Green Jade' },
      { productId: 'p-17', productName: 'Amber & Cedar Candle', productSlug: 'scented-soy-candle', productImage: ASSETS.categories.beauty, price: 42, quantity: 1, size: '8 oz', color: 'Amber & Cedar' },
    ],
  },

  // ── CANCELLED (2) ─────────────────────────────────────────────────────────

  {
    id: 'ord-1011',
    userId: 'cust-4',
    status: 'cancelled',
    subtotal: 98, shipping: 8, total: 106,
    createdAt: '2026-08-18',
    cancelledAt: '2026-08-18',
    cancellationReason: 'Customer changed their mind',
    shippingAddress: '47 Al Rasheed, Dubai, UAE',
    recipientName: 'Omar Hassan', phoneNumber: '+971 4 555 0144',
    paymentMethod: 'Cash on Delivery',
    statusHistory: [
      { status: 'placed',    at: '2026-08-18T10:00:00Z', note: 'Order placed' },
      { status: 'confirmed', at: '2026-08-18T10:30:00Z', note: 'Confirmed' },
      { status: 'cancelled', at: '2026-08-18T14:00:00Z', note: 'Cancelled: Customer changed their mind' },
    ],
    lines: [
      { productId: 'p-3', productName: 'Merino Crew Sweater', productSlug: 'merino-crew', productImage: ASSETS.categories.sport, price: 98, quantity: 1, size: 'L', color: 'Navy' },
    ],
  },

  {
    id: 'ord-1012',
    userId: 'cust-8',
    status: 'cancelled',
    subtotal: 165, shipping: 12, total: 177,
    createdAt: '2026-08-24',
    cancelledAt: '2026-08-25',
    cancellationReason: 'Item out of stock after order placement',
    shippingAddress: '200 Av Paulista, São Paulo, Brazil',
    recipientName: 'Lucas Ferreira', phoneNumber: '+55 11 555 0133',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',    at: '2026-08-24T13:00:00Z', note: 'Order placed' },
      { status: 'confirmed', at: '2026-08-24T13:30:00Z', note: 'Confirmed' },
      { status: 'processing',at: '2026-08-25T08:00:00Z', note: 'Processing started' },
      { status: 'cancelled', at: '2026-08-25T10:00:00Z', note: 'Cancelled: Item out of stock after order placement' },
    ],
    lines: [
      { productId: 'p-9', productName: 'Satin Midi Dress', productSlug: 'satin-midi', productImage: ASSETS.categories.apparel, price: 165, quantity: 1, size: 'M', color: 'Black' },
    ],
  },

  // ── SHIPPED / OUT FOR DELIVERY (3) ────────────────────────────────────────

  {
    id: 'ord-1013',
    userId: 'cust-7',
    status: 'shipped',
    subtotal: 383, shipping: 0, total: 383,
    createdAt: '2026-08-26',
    shippingAddress: '22 Colaba Causeway, Mumbai, India',
    recipientName: 'Priya Sharma', phoneNumber: '+91 22 555 0199',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',     at: '2026-08-26T09:00:00Z', note: 'Order placed' },
      { status: 'confirmed',  at: '2026-08-26T09:30:00Z', note: 'Confirmed' },
      { status: 'processing', at: '2026-08-27T08:00:00Z', note: 'Processing' },
      { status: 'packed',     at: '2026-08-28T09:00:00Z', note: 'Packed' },
      { status: 'shipped',    at: '2026-08-28T15:00:00Z', note: 'Shipped via FedEx #FX994421' },
    ],
    lines: [
      { productId: 'p-11', productName: 'Minimal Watch', productSlug: 'minimal-watch', productImage: ASSETS.categories.tech, price: 295, quantity: 1, size: 'One Size', color: 'Gold' },
      { productId: 'p-7', productName: 'Ceramic Vase', productSlug: 'ceramic-vase', productImage: ASSETS.categories.home, price: 54, quantity: 1, size: 'One Size', color: 'Clay' },
      { productId: 'p-16', productName: 'Mineral Soak Bath Salts', productSlug: 'mineral-bath-salts', productImage: ASSETS.categories.beauty, price: 34, quantity: 1, size: '500g', color: 'Lavender Dusk' },
    ],
  },

  {
    id: 'ord-1014',
    userId: 'cust-3',
    status: 'out_for_delivery',
    subtotal: 308, shipping: 0, total: 308,
    createdAt: '2026-08-27',
    shippingAddress: '88 Charlottenburg, Berlin, Germany',
    recipientName: 'Emma Klein', phoneNumber: '+49 30 555 0123',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',           at: '2026-08-27T11:00:00Z', note: 'Order placed' },
      { status: 'confirmed',        at: '2026-08-27T11:30:00Z', note: 'Confirmed' },
      { status: 'processing',       at: '2026-08-28T08:00:00Z', note: 'Processing' },
      { status: 'packed',           at: '2026-08-29T08:00:00Z', note: 'Packed' },
      { status: 'shipped',          at: '2026-08-29T14:00:00Z', note: 'Shipped via DHL' },
      { status: 'out_for_delivery', at: '2026-09-01T08:00:00Z', note: 'Out for last-mile delivery' },
    ],
    lines: [
      { productId: 'p-1', productName: 'Linen Blazer', productSlug: 'linen-blazer', productImage: ASSETS.categories.apparel, price: 189, quantity: 1, size: 'L', color: 'Olive' },
      { productId: 'p-20', productName: 'Eco-Grip Yoga Mat', productSlug: 'recycled-training-mat', productImage: ASSETS.categories.sport, price: 76, quantity: 1, size: '5mm Standard', color: 'Sage' },
      { productId: 'p-18', productName: 'Rose Quartz Gua Sha', productSlug: 'gua-sha-sculpting-tool', productImage: ASSETS.categories.beauty, price: 32, quantity: 1, size: 'One Size', color: 'Rose Quartz' },
    ],
  },

  {
    id: 'ord-1015',
    userId: 'cust-5',
    status: 'shipped',
    subtotal: 540, shipping: 0, total: 540,
    createdAt: '2026-08-28',
    shippingAddress: '9 Maximilianstr, Munich, Germany',
    recipientName: 'Lena Bauer', phoneNumber: '+49 89 555 0177',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',    at: '2026-08-28T10:15:00Z', note: 'Order placed' },
      { status: 'confirmed', at: '2026-08-28T10:45:00Z', note: 'Confirmed' },
      { status: 'processing',at: '2026-08-29T08:00:00Z', note: 'Processing' },
      { status: 'packed',    at: '2026-08-30T09:00:00Z', note: 'Items packed' },
      { status: 'shipped',   at: '2026-08-30T15:00:00Z', note: 'In transit (DHL #DHL778891)' },
    ],
    lines: [
      { productId: 'p-13', productName: 'Structured Cotton Trench', productSlug: 'cotton-trench-coat', productImage: ASSETS.categories.apparel, price: 260, quantity: 1, size: 'S', color: 'Camel' },
      { productId: 'p-22', productName: 'Minimalist Laptop Sleeve', productSlug: 'leather-laptop-sleeve', productImage: ASSETS.categories.tech, price: 88, quantity: 1, size: '15-inch', color: 'Espresso' },
      { productId: 'p-5', productName: 'Leather Tote', productSlug: 'leather-tote', productImage: ASSETS.categories.tech, price: 192, quantity: 1, size: 'One Size', color: 'Cognac' },
    ],
  },

  // ── PROCESSING / PACKED (4) ───────────────────────────────────────────────

  {
    id: 'ord-1016',
    userId: 'cust-2',
    status: 'processing',
    subtotal: 426, shipping: 0, total: 426,
    createdAt: '2026-08-29',
    shippingAddress: '14 Lombard Street, London, UK',
    recipientName: 'James Liu', phoneNumber: '+44 207 555 0198',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',     at: '2026-08-29T14:20:00Z', note: 'Order placed' },
      { status: 'confirmed',  at: '2026-08-29T15:00:00Z', note: 'Confirmed' },
      { status: 'processing', at: '2026-08-30T09:00:00Z', note: 'Fulfillment assigned' },
    ],
    lines: [
      { productId: 'p-5', productName: 'Leather Tote', productSlug: 'leather-tote', productImage: ASSETS.categories.tech, price: 220, quantity: 1, size: 'One Size', color: 'Cognac' },
      { productId: 'p-7', productName: 'Ceramic Vase', productSlug: 'ceramic-vase', productImage: ASSETS.categories.home, price: 54, quantity: 1, size: 'One Size', color: 'Clay' },
      { productId: 'p-8', productName: 'Wool Throw Blanket', productSlug: 'wool-throw', productImage: ASSETS.hero, price: 120, quantity: 1, size: 'One Size', color: 'Oat' },
      { productId: 'p-18', productName: 'Rose Quartz Gua Sha', productSlug: 'gua-sha-sculpting-tool', productImage: ASSETS.categories.beauty, price: 32, quantity: 1, size: 'One Size', color: 'Rose Quartz' },
    ],
  },

  {
    id: 'ord-1017',
    userId: 'cust-9',
    status: 'packed',
    subtotal: 233, shipping: 0, total: 233,
    createdAt: '2026-08-30',
    shippingAddress: '15 Cantonments Rd, Accra, Ghana',
    recipientName: 'Amara Osei', phoneNumber: '+233 30 555 0122',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',     at: '2026-08-30T10:00:00Z', note: 'Order placed' },
      { status: 'confirmed',  at: '2026-08-30T10:30:00Z', note: 'Confirmed' },
      { status: 'processing', at: '2026-08-31T08:00:00Z', note: 'Processing' },
      { status: 'packed',     at: '2026-08-31T14:00:00Z', note: 'Items inspected and packed' },
    ],
    lines: [
      { productId: 'p-14', productName: 'Pleated Wool Trouser', productSlug: 'pleated-wool-trouser', productImage: ASSETS.hero, price: 135, quantity: 1, size: '30', color: 'Taupe' },
      { productId: 'p-19', productName: 'Seamless Studio Legging', productSlug: 'seamless-active-legging', productImage: ASSETS.categories.sport, price: 84, quantity: 1, size: 'M', color: 'Clay' },
      { productId: 'p-6', productName: 'Silk Scarf', productSlug: 'silk-scarf', productImage: ASSETS.categories.beauty, price: 65, quantity: 1, size: 'One Size', color: 'Rust' },
    ],
  },

  {
    id: 'ord-1018',
    userId: 'cust-1',
    status: 'processing',
    subtotal: 328, shipping: 0, total: 328,
    createdAt: '2026-08-31',
    shippingAddress: '123 Market St, Apt 4B, San Francisco, CA 94103, US',
    recipientName: 'Sarah Mitchell', phoneNumber: '+1 (555) 234-5678',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',     at: '2026-08-31T14:20:00Z', note: 'Order placed' },
      { status: 'confirmed',  at: '2026-08-31T15:00:00Z', note: 'Confirmed' },
      { status: 'processing', at: '2026-08-31T16:30:00Z', note: 'Fulfillment queue assignment' },
    ],
    lines: [
      { productId: 'p-24', productName: 'Linear Task Lamp', productSlug: 'aluminum-desk-lamp', productImage: ASSETS.categories.tech, price: 175, quantity: 1, size: 'One Size', color: 'Matte Black' },
      { productId: 'p-23', productName: 'Catchall Wireless Charger', productSlug: 'wireless-charging-tray', productImage: ASSETS.categories.tech, price: 120, quantity: 1, size: 'Standard Dual', color: 'Sandstone & Clay' },
      { productId: 'p-7', productName: 'Ceramic Vase', productSlug: 'ceramic-vase', productImage: ASSETS.categories.home, price: 54, quantity: 1, size: 'One Size', color: 'White' },
    ],
  },

  {
    id: 'ord-1019',
    userId: 'cust-6',
    status: 'packed',
    subtotal: 207, shipping: 0, total: 207,
    createdAt: '2026-08-31',
    shippingAddress: '3-5-1 Nishi-Shinjuku, Tokyo, Japan',
    recipientName: 'Kai Tanaka', phoneNumber: '+81 3 555 0188',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',     at: '2026-08-31T03:00:00Z', note: 'Order placed' },
      { status: 'confirmed',  at: '2026-08-31T03:30:00Z', note: 'Confirmed' },
      { status: 'processing', at: '2026-09-01T08:00:00Z', note: 'Processing' },
      { status: 'packed',     at: '2026-09-01T13:00:00Z', note: 'Packed for shipment' },
    ],
    lines: [
      { productId: 'p-3', productName: 'Merino Crew Sweater', productSlug: 'merino-crew', productImage: ASSETS.categories.sport, price: 98, quantity: 1, size: 'M', color: 'Forest' },
      { productId: 'p-21', productName: 'Packable Trail Windbreaker', productSlug: 'lightweight-windbreaker', productImage: ASSETS.categories.sport, price: 115, quantity: 1, size: 'L', color: 'Sandstone' },
    ],
  },

  // ── PLACED / CONFIRMED (4) ────────────────────────────────────────────────

  {
    id: 'ord-1020',
    userId: 'cust-7',
    status: 'confirmed',
    subtotal: 130, shipping: 0, total: 130,
    createdAt: '2026-08-31',
    shippingAddress: '22 Colaba Causeway, Mumbai, India',
    recipientName: 'Priya Sharma', phoneNumber: '+91 22 555 0199',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',    at: '2026-08-31T18:00:00Z', note: 'Order placed' },
      { status: 'confirmed', at: '2026-08-31T18:30:00Z', note: 'Payment verified' },
    ],
    lines: [
      { productId: 'p-10', productName: 'Oxford Shirt', productSlug: 'oxford-shirt', productImage: ASSETS.categories.sport, price: 72, quantity: 1, size: 'M', color: 'White' },
      { productId: 'p-17', productName: 'Amber & Cedar Candle', productSlug: 'scented-soy-candle', productImage: ASSETS.categories.beauty, price: 42, quantity: 1, size: '8 oz', color: 'Amber & Cedar' },
      { productId: 'p-16', productName: 'Mineral Soak Bath Salts', productSlug: 'mineral-bath-salts', productImage: ASSETS.categories.beauty, price: 36, quantity: 1, size: '500g', color: 'Lavender Dusk' },
    ],
  },

  {
    id: 'ord-1021',
    userId: 'cust-4',
    status: 'placed',
    subtotal: 175, shipping: 12, total: 187,
    createdAt: '2026-09-01',
    shippingAddress: '47 Al Rasheed, Dubai, UAE',
    recipientName: 'Omar Hassan', phoneNumber: '+971 4 555 0144',
    paymentMethod: 'Cash on Delivery',
    statusHistory: [
      { status: 'placed', at: '2026-09-01T07:00:00Z', note: 'Order placed by customer' },
    ],
    lines: [
      { productId: 'p-24', productName: 'Linear Task Lamp', productSlug: 'aluminum-desk-lamp', productImage: ASSETS.categories.tech, price: 175, quantity: 1, size: 'One Size', color: 'Silver' },
    ],
  },

  {
    id: 'ord-1022',
    userId: 'cust-5',
    status: 'placed',
    subtotal: 280, shipping: 0, total: 280,
    createdAt: '2026-09-01',
    shippingAddress: '9 Maximilianstr, Munich, Germany',
    recipientName: 'Lena Bauer', phoneNumber: '+49 89 555 0177',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed', at: '2026-09-01T08:30:00Z', note: 'Order placed by customer' },
    ],
    lines: [
      { productId: 'p-25', productName: 'Artisan Dinnerware Set', productSlug: 'stoneware-dinnerware-set', productImage: ASSETS.categories.home, price: 210, quantity: 1, size: '16-Piece Service for 4', color: 'Chalk White' },
      { productId: 'p-7', productName: 'Ceramic Vase', productSlug: 'ceramic-vase', productImage: ASSETS.categories.home, price: 54, quantity: 1, size: 'One Size', color: 'Clay' },
      { productId: 'p-26', productName: 'Waffle Knit Bath Set', productSlug: 'waffle-bath-towel-set', productImage: ASSETS.categories.home, price: 16, quantity: 1, size: '4-Piece Set', color: 'Sand' },
    ],
  },

  {
    id: 'ord-1023',
    userId: 'cust-10',
    status: 'confirmed',
    subtotal: 98, shipping: 8, total: 106,
    createdAt: '2026-09-01',
    shippingAddress: '12 Torvet, Copenhagen, Denmark',
    recipientName: 'Nora Andersen', phoneNumber: '+45 33 555 0112',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed',    at: '2026-09-01T09:00:00Z', note: 'Order placed' },
      { status: 'confirmed', at: '2026-09-01T09:15:00Z', note: 'Payment verified' },
    ],
    lines: [
      { productId: 'p-3', productName: 'Merino Crew Sweater', productSlug: 'merino-crew', productImage: ASSETS.categories.sport, price: 98, quantity: 1, size: 'S', color: 'Stone' },
    ],
  },

  {
    id: 'ord-1024',
    userId: 'cust-3',
    status: 'placed',
    subtotal: 488, shipping: 0, total: 488,
    createdAt: '2026-09-01',
    shippingAddress: '88 Charlottenburg, Berlin, Germany',
    recipientName: 'Emma Klein', phoneNumber: '+49 30 555 0123',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed', at: '2026-09-01T11:00:00Z', note: 'Order placed by customer' },
    ],
    lines: [
      { productId: 'p-11', productName: 'Minimal Watch', productSlug: 'minimal-watch', productImage: ASSETS.categories.tech, price: 295, quantity: 1, size: 'One Size', color: 'Gold' },
      { productId: 'p-26', productName: 'Waffle Knit Bath Set', productSlug: 'waffle-bath-towel-set', productImage: ASSETS.categories.home, price: 92, quantity: 1, size: '4-Piece Set', color: 'Slate' },
      { productId: 'p-19', productName: 'Seamless Studio Legging', productSlug: 'seamless-active-legging', productImage: ASSETS.categories.sport, price: 84, quantity: 1, size: 'S', color: 'Midnight' },
      { productId: 'p-6', productName: 'Silk Scarf', productSlug: 'silk-scarf', productImage: ASSETS.categories.beauty, price: 65, quantity: 1, size: 'One Size', color: 'Rust' },
    ],
  },

  {
    id: 'ord-1025',
    userId: 'cust-1',
    status: 'placed',
    subtotal: 342, shipping: 0, total: 342,
    createdAt: '2026-09-01',
    shippingAddress: '123 Market St, Apt 4B, San Francisco, CA 94103, US',
    recipientName: 'Sarah Mitchell', phoneNumber: '+1 (555) 234-5678',
    paymentMethod: 'Credit / Debit Card',
    statusHistory: [
      { status: 'placed', at: '2026-09-01T14:00:00Z', note: 'Order placed by customer' },
    ],
    lines: [
      { productId: 'p-23', productName: 'Catchall Wireless Charger', productSlug: 'wireless-charging-tray', productImage: ASSETS.categories.tech, price: 120, quantity: 1, size: 'Standard Dual', color: 'Charcoal & Ink' },
      { productId: 'p-15', productName: 'Botanical Face Oil', productSlug: 'botanical-face-oil', productImage: ASSETS.categories.beauty, price: 58, quantity: 2, size: '30ml', color: 'Original 30ml' },
      { productId: 'p-8', productName: 'Wool Throw Blanket', productSlug: 'wool-throw', productImage: ASSETS.hero, price: 120, quantity: 1, size: 'One Size', color: 'Slate' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'Product Updated',       actor: 'admin@salla.studio', target: 'Linen Blazer',       timestamp: '2026-08-30T14:22:00Z', details: 'Price changed from $240 to $189' },
  { id: 'log-2', action: 'Order Status Changed',  actor: 'admin@salla.studio', target: 'ord-1015',            timestamp: '2026-08-30T15:00:00Z', details: 'Status changed to shipped' },
  { id: 'log-3', action: 'Customer Deactivated',  actor: 'admin@salla.studio', target: 'nora@example.com',    timestamp: '2026-08-25T16:40:00Z', details: 'Account marked inactive' },
  { id: 'log-4', action: 'Order Cancelled',        actor: 'admin@salla.studio', target: 'ord-1012',            timestamp: '2026-08-25T10:00:00Z', details: 'Item out of stock after order placement' },
  { id: 'log-5', action: 'Order Status Changed',  actor: 'admin@salla.studio', target: 'ord-1013',            timestamp: '2026-08-28T15:00:00Z', details: 'Status changed to shipped' },
  { id: 'log-6', action: 'Product Created',        actor: 'admin@salla.studio', target: 'Artisan Dinnerware Set', timestamp: '2026-08-20T09:00:00Z', details: 'New product added to Home category' },
  { id: 'log-7', action: 'Order Status Changed',  actor: 'admin@salla.studio', target: 'ord-1014',            timestamp: '2026-09-01T08:00:00Z', details: 'Status changed to out_for_delivery' },
];
