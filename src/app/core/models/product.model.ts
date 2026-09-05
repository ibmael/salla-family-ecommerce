export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image: string;
  images: string[];
  videoUrl?: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  tags: string[];
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

