import { Category, Product, Review } from '../../core/models/product.model';
import { ASSETS } from '../../core/constants/assets';

const productImages = [
  ASSETS.categories.apparel,
  ASSETS.categories.beauty,
  ASSETS.categories.home,
  ASSETS.categories.sport,
  ASSETS.categories.tech,
  ASSETS.hero,
];

const img = (index: number) => productImages[index % productImages.length];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'apparel', name: 'Apparel', description: 'Refined essentials and statement pieces', image: ASSETS.categories.apparel, productCount: 4 },
  { id: 'cat-2', slug: 'beauty', name: 'Beauty', description: 'Curated skincare and self-care rituals', image: ASSETS.categories.beauty, productCount: 2 },
  { id: 'cat-3', slug: 'sport', name: 'Sport', description: 'Performance wear with premium comfort', image: ASSETS.categories.sport, productCount: 2 },
  { id: 'cat-4', slug: 'tech', name: 'Tech', description: 'Modern accessories for everyday life', image: ASSETS.categories.tech, productCount: 2 },
  { id: 'cat-5', slug: 'home', name: 'Home', description: 'Warm textures for considered living', image: ASSETS.categories.home, productCount: 2 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1', slug: 'linen-blazer', name: 'Linen Blazer', description: 'A relaxed blazer in breathable European linen with soft structure and clean lines.',
    price: 189, originalPrice: 240, category: 'Apparel', categoryId: 'cat-1', image: img(0), images: [img(0), img(5)],
    colors: ['Sand', 'Olive', 'Ink'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.8, reviews: 124,
    tags: ['trending', 'sale'], inStock: true, featured: true, trending: true,
  },
  {
    id: 'p-2', slug: 'cashmere-wrap', name: 'Cashmere Wrap', description: 'Ultra-soft wrap knit from ethically sourced cashmere.',
    price: 145, category: 'Apparel', categoryId: 'cat-1', image: img(1), images: [img(1), img(0)],
    colors: ['Cream', 'Charcoal'], sizes: ['One Size'], rating: 4.9, reviews: 89, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-3', slug: 'merino-crew', name: 'Merino Crew Sweater', description: 'Fine-gauge merino with a modern relaxed fit.',
    price: 98, category: 'Sport', categoryId: 'cat-3', image: img(2), images: [img(2)],
    colors: ['Navy', 'Stone', 'Forest'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.7, reviews: 203, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-4', slug: 'tailored-chino', name: 'Tailored Chino', description: 'Stretch cotton chinos with a tapered leg and hidden comfort waistband.',
    price: 78, originalPrice: 98, category: 'Apparel', categoryId: 'cat-1', image: img(3), images: [img(3)],
    colors: ['Khaki', 'Navy', 'Black'], sizes: ['30', '32', '34', '36'], rating: 4.6, reviews: 156, tags: ['sale'], inStock: true,
  },
  {
    id: 'p-5', slug: 'leather-tote', name: 'Leather Tote', description: 'Vegetable-tanned leather tote with interior pockets and magnetic closure.',
    price: 220, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4), img(3)],
    colors: ['Cognac', 'Black'], sizes: ['One Size'], rating: 4.9, reviews: 67, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-6', slug: 'silk-scarf', name: 'Silk Scarf', description: 'Hand-finished silk scarf with an abstract botanical print.',
    price: 65, category: 'Beauty', categoryId: 'cat-2', image: img(1), images: [img(1)],
    colors: ['Ivory', 'Rust'], sizes: ['One Size'], rating: 4.5, reviews: 42, tags: [], inStock: true,
  },
  {
    id: 'p-7', slug: 'ceramic-vase', name: 'Ceramic Vase', description: 'Hand-thrown stoneware vase with a matte glaze finish.',
    price: 54, category: 'Home', categoryId: 'cat-5', image: img(2), images: [img(2)],
    colors: ['Clay', 'White'], sizes: ['One Size'], rating: 4.8, reviews: 31, tags: [], inStock: true,
  },
  {
    id: 'p-8', slug: 'wool-throw', name: 'Wool Throw Blanket', description: 'Soft merino wool throw with fringed edges.',
    price: 120, originalPrice: 150, category: 'Home', categoryId: 'cat-5', image: img(5), images: [img(5)],
    colors: ['Oat', 'Slate'], sizes: ['One Size'], rating: 4.7, reviews: 88, tags: ['sale', 'trending'], inStock: true, trending: true,
  },
  {
    id: 'p-9', slug: 'satin-midi', name: 'Satin Midi Dress', description: 'Fluid satin midi with adjustable straps and side slit.',
    price: 165, category: 'Apparel', categoryId: 'cat-1', image: img(0), images: [img(0)],
    colors: ['Champagne', 'Black'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.6, reviews: 97, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-10', slug: 'oxford-shirt', name: 'Oxford Shirt', description: 'Classic oxford cloth button-down with mother-of-pearl buttons.',
    price: 72, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['White', 'Blue', 'Pink'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviews: 178, tags: [], inStock: true,
  },
  {
    id: 'p-11', slug: 'minimal-watch', name: 'Minimal Watch', description: 'Swiss movement watch with sapphire crystal and leather strap.',
    price: 295, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4)],
    colors: ['Silver', 'Gold'], sizes: ['One Size'], rating: 4.9, reviews: 54, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-12', slug: 'linen-sheet-set', name: 'Linen Sheet Set', description: 'Stone-washed linen sheets that get softer with every wash.',
    price: 198, originalPrice: 248, category: 'Home', categoryId: 'cat-5', image: img(2), images: [img(2)],
    colors: ['Natural', 'Grey'], sizes: ['Queen', 'King'], rating: 4.8, reviews: 112, tags: ['sale'], inStock: true,
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r-1', productId: 'p-1', author: 'Sarah M.', rating: 5, comment: 'Perfect fit and beautiful fabric. Wears beautifully all day.', createdAt: '2026-08-15' },
  { id: 'r-2', productId: 'p-1', author: 'James L.', rating: 4, comment: 'Great quality, runs slightly large. Size down if between sizes.', createdAt: '2026-07-22' },
  { id: 'r-3', productId: 'p-3', author: 'Emma K.', rating: 5, comment: 'The softest sweater I own. Worth every penny.', createdAt: '2026-08-01' },
];
