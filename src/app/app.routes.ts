import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    title: 'Admin',
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () =>
          import('./features/admin/products/products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'orders',
        title: 'Orders',
        loadComponent: () =>
          import('./features/admin/orders/orders.component').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'orders/:id',
        title: 'Order Details',
        loadComponent: () =>
          import('./features/admin/orders/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent,
          ),
      },
      {
        path: 'customers',
        title: 'Customers',
        loadComponent: () =>
          import('./features/admin/customers/customers.component').then(
            (m) => m.AdminCustomersComponent,
          ),
      },
      {
        path: 'customers/:id',
        title: 'Customer Details',
        loadComponent: () =>
          import('./features/admin/customers/customer-detail.component').then(
            (m) => m.AdminCustomerDetailComponent,
          ),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadComponent: () =>
          import('./features/admin/categories/categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'audit-logs',
        title: 'Audit Logs',
        loadComponent: () =>
          import('./features/admin/audit-logs/audit-logs.component').then(
            (m) => m.AdminAuditLogsComponent,
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/store-layout/store-layout.component').then((m) => m.StoreLayoutComponent),
    children: [
      {
        path: '',
        title: 'Home',
        loadComponent: () =>
          import('./features/storefront/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadComponent: () =>
          import('./features/storefront/categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },
      {
        path: 'category',
        title: 'Shop All',
        loadComponent: () =>
          import('./features/storefront/category/catalog.component').then(
            (m) => m.CatalogComponent,
          ),
      },
      {
        path: 'category/:slug',
        title: 'Category',
        loadComponent: () =>
          import('./features/storefront/category/catalog.component').then(
            (m) => m.CatalogComponent,
          ),
      },
      {
        path: 'product/:slug',
        title: 'Product',
        loadComponent: () =>
          import('./features/storefront/product/product.component').then((m) => m.ProductComponent),
      },
      {
        path: 'search',
        title: 'Search',
        loadComponent: () =>
          import('./features/storefront/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'cart',
        title: 'Cart',
        loadComponent: () =>
          import('./features/storefront/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'wishlist',
        title: 'Wishlist',
        loadComponent: () =>
          import('./features/storefront/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent,
          ),
      },
      {
        path: 'checkout',
        title: 'Checkout',
        loadComponent: () =>
          import('./features/storefront/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'order/confirmed',
        title: 'Order Confirmed',
        loadComponent: () =>
          import('./features/storefront/checkout/confirmation.component').then(
            (m) => m.ConfirmationComponent,
          ),
      },
      {
        path: 'auth',
        title: 'Sign In',
        loadComponent: () =>
          import('./features/storefront/auth/auth.component').then((m) => m.AuthComponent),
      },
      {
        path: 'account',
        title: 'My Account',
        loadComponent: () =>
          import('./features/storefront/account/account.component').then((m) => m.AccountComponent),
        canActivate: [authGuard],
      },
      {
        path: 'orders',
        title: 'My Orders',
        loadComponent: () =>
          import('./features/storefront/orders/orders.component').then((m) => m.OrdersComponent),
        canActivate: [authGuard],
      },
      {
        path: 'orders/:id',
        title: 'Order Details',
        loadComponent: () =>
          import('./features/storefront/orders/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: '**',
        title: 'Page Not Found',
        loadComponent: () =>
          import('./features/storefront/not-found/not-found.component').then(
            (m) => m.NotFoundComponent,
          ),
      },
    ],
  },
];
