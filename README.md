# 🛍️ Salla — Modern E-Commerce Platform

A modern, responsive e-commerce frontend built with **Angular 22**, focused on clean architecture, scalable state management, premium UI/UX, and a backend-ready repository pattern.

Salla includes both a complete **customer storefront** and a dedicated **admin dashboard**, with mock repositories currently acting as a temporary data layer until the real backend API is connected.

---

## ✨ Overview

Salla is designed as a production-style e-commerce application rather than a simple UI demo.

The application contains two independent experiences:

### 🛒 Storefront

The customer-facing shopping experience.

### ⚙️ Admin Dashboard

A dedicated operational interface for managing the store.

The two areas use separate layouts while sharing core infrastructure such as authentication, repositories, domain models, theme management, and reusable UI components.

---

## 🚀 Tech Stack

- **Angular 22**
- **TypeScript 6**
- **Standalone Components**
- **Angular Signals**
- **OnPush Change Detection**
- **Angular SSR**
- **Tailwind CSS v4**
- **Reactive Forms**
- **Lucide Angular**
- **Embla Carousel**
- **date-fns**
- **Zod**
- **Local Storage Mock Persistence**
- **Repository Pattern**
- **Lazy-loaded Routes**

---

## 🛍️ Storefront Features

### Home Experience

- Responsive premium storefront
- Interactive hero carousel
- Featured products
- Trending products
- Category discovery
- Deals
- Responsive navigation
- Dark / Light theme support

### Product Catalog

- Product listing
- Category filtering
- Search
- Product details
- Product images
- Sizes and colors
- Stock availability
- Related products
- Featured and trending products

### Shopping Experience

- Shopping cart
- Wishlist
- Quantity management
- Product options
- Persistent client-side state
- Authentication-aware shopping actions

### Checkout

- Checkout flow
- Delivery information
- Order summary
- Product snapshots
- Order confirmation

### Customer Account

- Authentication
- Registration
- Login
- Customer profile
- Profile image support
- Account information
- Order history
- Order details
- Wishlist
- Persistent session state

### Order Tracking

Orders support a complete lifecycle:

```text
Order Placed
    ↓
Confirmed
    ↓
Processing
    ↓
Packed
    ↓
Shipped
    ↓
Out for Delivery
    ↓
Delivered
```

Orders can also enter a separate **Cancelled** state where applicable.

---

# ⚙️ Admin Dashboard

Salla contains a dedicated Admin experience under:

```text
/admin
```

The Admin uses its own layout and navigation system, independent from the customer storefront.

---

## 📊 Admin Dashboard

The dashboard provides operational store insights including:

- Total revenue
- Total orders
- Customer count
- Product count
- 7-day sales overview
- 30-day sales overview
- Revenue comparison
- Top-selling products
- Recent orders
- Recent activity

Dashboard statistics are calculated from repository data rather than hardcoded UI values.

---

## 📦 Product Management

Admin users can:

- View products
- Search products
- Filter products
- Sort products
- Create products
- Edit products
- Delete products
- Manage product pricing
- Manage original / sale prices
- Manage categories
- Manage product images
- Manage sizes
- Manage colors
- Manage stock availability
- Manage featured products
- Manage trending products

Historical orders preserve product snapshots even when catalog products change.

---

## 🏷️ Category Management

Admin users can:

- View categories
- Search categories
- Create categories
- Edit categories
- Upload category images
- Delete empty categories

Categories containing products are protected from unsafe deletion.

---

## 📦 Order Management

Admin users can:

- View all orders
- Search orders
- Filter by status
- Sort orders
- Open order details
- Inspect customer information
- Inspect delivery information
- Inspect payment information
- Inspect ordered products
- Update order status
- Cancel eligible orders

Order status transitions follow the application's defined lifecycle.

---

## 👥 Customer Management

The Admin includes a lightweight CRM-style customer management experience.

### Customer List

Admin users can:

- Search customers
- Sort customers
- View total customer count
- View customers with orders
- Identify repeat customers
- View customer spending
- View latest order activity

### Customer Details

Each customer has a dedicated Admin view containing:

- Customer identity
- Profile image / initials fallback
- Contact information
- Join date
- Total spent
- Total orders
- Average order value
- Latest order
- Latest delivery address
- Complete order history
- Frequently purchased products

Sensitive authentication information is never exposed through Admin customer views.

---

# 🏗️ Architecture

Salla uses a repository-based architecture to keep the UI independent from the data source.

Current architecture:

```text
Angular Component
       ↓
Repository Interface / Injection Token
       ↓
Mock Repository
       ↓
Browser Storage / Mock Data
```

Future backend architecture:

```text
Angular Component
       ↓
Repository Interface / Injection Token
       ↓
HTTP Repository
       ↓
REST API
       ↓
Database
```

This allows the real backend to replace the temporary mock infrastructure without requiring major UI rewrites.

---

## 🔌 Backend Ready

The mock layer is intentionally temporary.

Mock-specific logic is isolated inside the data/repository infrastructure.

UI components do not directly depend on:

```text
MOCK_PRODUCTS
MOCK_ORDERS
MOCK_CUSTOMERS
localStorage
BrowserStorageService
```

Instead, features communicate through repository abstractions.

When the backend becomes available, the migration should mainly require:

1. Implementing HTTP repositories
2. Connecting API endpoints
3. Switching dependency injection providers
4. Configuring the API base URL
5. Replacing mock authentication
6. Removing temporary mock seed/storage infrastructure

The Storefront and Admin UI should require minimal changes.

---

# 🧱 Application Structure

```text
src/app/
│
├── core/
│   ├── api/
│   ├── guards/
│   ├── repositories/
│   ├── services/
│   └── strategies/
│
├── data/
│   └── mocks/
│
├── features/
│   ├── admin/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── customers/
│   │
│   ├── auth/
│   ├── cart/
│   ├── catalog/
│   ├── checkout/
│   ├── home/
│   ├── orders/
│   └── account/
│
├── layout/
│
├── shared/
│   ├── components/
│   └── ui/
│
└── app.routes.ts
```

---

# 🎨 Design System

Salla uses a warm, minimal, editorial-inspired design language.

### Main Colors

```text
Paper   #f7f4ef
Ink     #1a1714
Sand    #ebe4d8
Clay    #b86f52
Moss    #4a5d4e
Stone   #8a8178
```

### Typography

- **Space Grotesk** — headings
- **DM Sans** — body content

### UI Principles

- Warm neutral palette
- Generous whitespace
- Soft rounded surfaces
- Subtle interaction
- Responsive layouts
- Accessible focus states
- Minimal visual noise
- No unnecessary UI libraries

---

# 🌙 Theme Support

Salla supports:

- ☀️ Light Mode
- 🌙 Dark Mode

Theme preference is managed globally and persists across navigation.

The Storefront and Admin share the same theme preference while maintaining independent layouts.

---

# 📱 Responsive Design

The application is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

Layouts are tested across common breakpoints including:

```text
1440px
1024px
768px
430px
390px
360px
```

Admin data tables transform into mobile-friendly cards where appropriate to avoid horizontal overflow.

---

# ⚡ Performance

The project uses modern Angular performance patterns including:

- Standalone Components
- Lazy-loaded routes
- Angular Signals
- OnPush Change Detection
- Optimized image assets
- Lightweight CSS interactions
- Repository-based data access
- SSR support

---

# 🔐 Security Architecture

The current authentication system is a frontend mock implementation for development purposes.

The application architecture is prepared for future backend authentication.

Admin interfaces never expose:

- Passwords
- Password hashes
- Authentication tokens
- Session internals

Production authentication and authorization will ultimately be enforced by the backend.

---

# 🧪 Current Data Layer

The application currently uses mock repositories with browser persistence for development.

This allows the complete Storefront and Admin workflows to be tested before the backend is available.

> **Important:** Mock data, browser storage, seeded accounts, and mock persistence are development infrastructure and are not intended to become the production data source.

---

# 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/ibmael/salla-family-ecommerce.git
```

Navigate to the project:

```bash
cd salla-family-ecommerce
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npm start
```

or:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

# 🏗️ Production Build

Run:

```bash
npm run build
```

The production bundle will be generated inside the Angular build output directory.

---

# 🗺️ Roadmap

### Frontend

- [x] Storefront architecture
- [x] Product catalog
- [x] Product details
- [x] Cart
- [x] Wishlist
- [x] Authentication UI
- [x] Customer account
- [x] Checkout
- [x] Order history
- [x] Order tracking
- [x] Admin layout
- [x] Admin dashboard
- [x] Product management
- [x] Category management
- [x] Order management
- [x] Customer management
- [ ] Admin audit logs
- [ ] Final Admin UX polish
- [ ] Final accessibility audit
- [ ] Final responsive audit

### Backend

- [ ] REST API
- [ ] Database integration
- [ ] Authentication API
- [ ] Role-based authorization
- [ ] Product API
- [ ] Category API
- [ ] Order API
- [ ] Customer API
- [ ] Image upload/storage
- [ ] Server-side audit logs
- [ ] Replace mock repositories with HTTP repositories

---

# 🎯 Project Goal

The goal of Salla is to demonstrate how a modern Angular e-commerce application can be structured for real-world growth.

Instead of coupling UI components directly to temporary data sources, the application uses clear abstractions that allow the current mock infrastructure to eventually be replaced by a real backend while preserving the Storefront and Admin experiences.

---

## 👨‍💻 Author

**Ibrahim Mahmoud**

Frontend Developer

---

## 📄 License

This project is intended for educational and portfolio purposes.
