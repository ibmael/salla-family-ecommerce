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
  { id: 'cat-1', slug: 'apparel', name: 'Apparel', description: 'Refined essentials and statement pieces', image: ASSETS.categories.apparel, productCount: 6 },
  { id: 'cat-2', slug: 'beauty', name: 'Beauty', description: 'Curated skincare and self-care rituals', image: ASSETS.categories.beauty, productCount: 5 },
  { id: 'cat-3', slug: 'sport', name: 'Sport', description: 'Performance wear with premium comfort', image: ASSETS.categories.sport, productCount: 5 },
  { id: 'cat-4', slug: 'tech', name: 'Tech', description: 'Modern accessories for everyday life', image: ASSETS.categories.tech, productCount: 5 },
  { id: 'cat-5', slug: 'home', name: 'Home', description: 'Warm textures for considered living', image: ASSETS.categories.home, productCount: 5 },
];

export const MOCK_PRODUCTS: Product[] = [
  // --- Apparel (cat-1) ---
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
    id: 'p-4', slug: 'tailored-chino', name: 'Tailored Chino', description: 'Stretch cotton chinos with a tapered leg and hidden comfort waistband.',
    price: 78, originalPrice: 98, category: 'Apparel', categoryId: 'cat-1', image: img(3), images: [img(3)],
    colors: ['Khaki', 'Navy', 'Black'], sizes: ['30', '32', '34', '36'], rating: 4.6, reviews: 156, tags: ['sale'], inStock: true,
  },
  {
    id: 'p-9', slug: 'satin-midi', name: 'Satin Midi Dress', description: 'Fluid satin midi with adjustable straps and side slit.',
    price: 165, category: 'Apparel', categoryId: 'cat-1', image: img(0), images: [img(0)],
    colors: ['Champagne', 'Black'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.6, reviews: 97, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-13', slug: 'cotton-trench-coat', name: 'Structured Cotton Trench', description: 'Double-breasted water-resistant trench coat with horn buttons and storm flap.',
    price: 260, originalPrice: 320, category: 'Apparel', categoryId: 'cat-1', image: img(0), images: [img(0), img(3)],
    colors: ['Camel', 'Oatmeal', 'Black'], sizes: ['S', 'M', 'L'], rating: 4.9, reviews: 48, tags: ['sale', 'featured'], inStock: true, featured: true,
  },
  {
    id: 'p-14', slug: 'pleated-wool-trouser', name: 'Pleated Wool Trouser', description: 'High-waisted tailored trousers in lightweight Italian wool blend.',
    price: 135, category: 'Apparel', categoryId: 'cat-1', image: img(5), images: [img(5)],
    colors: ['Taupe', 'Charcoal', 'Navy'], sizes: ['28', '30', '32', '34'], rating: 4.7, reviews: 63, tags: [], inStock: true,
  },

  // --- Beauty & Self-care (cat-2) ---
  {
    id: 'p-6', slug: 'silk-scarf', name: 'Silk Scarf', description: 'Hand-finished silk scarf with an abstract botanical print.',
    price: 65, category: 'Beauty', categoryId: 'cat-2', image: img(1), images: [img(1)],
    colors: ['Ivory', 'Rust'], sizes: ['One Size'], rating: 4.5, reviews: 42, tags: [], inStock: true,
  },
  {
    id: 'p-15', slug: 'botanical-face-oil', name: 'Botanical Face Oil', description: 'Cold-pressed botanical elixir rich in antioxidants and squalane for radiant skin.',
    price: 58, category: 'Beauty', categoryId: 'cat-2', image: img(1), images: [img(1)],
    colors: ['Original 30ml'], sizes: ['30ml', '50ml'], rating: 4.9, reviews: 110, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-16', slug: 'mineral-bath-salts', name: 'Mineral Soak Bath Salts', description: 'Dead Sea salts infused with lavender, bergamot, and cedarwood essential oils.',
    price: 36, originalPrice: 45, category: 'Beauty', categoryId: 'cat-2', image: img(1), images: [img(1)],
    colors: ['Lavender Dusk', 'Eucalyptus Morning'], sizes: ['500g'], rating: 4.8, reviews: 75, tags: ['sale'], inStock: true,
  },
  {
    id: 'p-17', slug: 'scented-soy-candle', name: 'Amber & Cedar Candle', description: 'Hand-poured soy wax candle in an amber glass jar with cotton wick. 60-hour burn time.',
    price: 42, category: 'Beauty', categoryId: 'cat-2', image: img(2), images: [img(2)],
    colors: ['Amber & Cedar', 'Smoked Fig'], sizes: ['8 oz'], rating: 4.7, reviews: 92, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-18', slug: 'gua-sha-sculpting-tool', name: 'Rose Quartz Gua Sha', description: 'Natural carved rose quartz tool designed to sculpt and release facial tension.',
    price: 32, category: 'Beauty', categoryId: 'cat-2', image: img(1), images: [img(1)],
    colors: ['Rose Quartz', 'Green Jade'], sizes: ['One Size'], rating: 4.6, reviews: 54, tags: [], inStock: true,
  },

  // --- Sport & Active (cat-3) ---
  {
    id: 'p-3', slug: 'merino-crew', name: 'Merino Crew Sweater', description: 'Fine-gauge merino with a modern relaxed fit.',
    price: 98, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['Navy', 'Stone', 'Forest'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.7, reviews: 203, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-10', slug: 'oxford-shirt', name: 'Oxford Shirt', description: 'Classic oxford cloth button-down with mother-of-pearl buttons.',
    price: 72, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['White', 'Blue', 'Pink'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviews: 178, tags: [], inStock: true,
  },
  {
    id: 'p-19', slug: 'seamless-active-legging', name: 'Seamless Studio Legging', description: 'High-waisted compression fabric with four-way stretch and moisture-wicking technology.',
    price: 84, originalPrice: 110, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['Olive', 'Midnight', 'Clay'], sizes: ['XS', 'S', 'M', 'L'], rating: 4.8, reviews: 142, tags: ['sale', 'trending'], inStock: true, trending: true,
  },
  {
    id: 'p-20', slug: 'recycled-training-mat', name: 'Eco-Grip Yoga Mat', description: 'Natural tree rubber base with non-slip cushioned surface and alignment cues.',
    price: 76, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['Sage', 'Charcoal'], sizes: ['5mm Standard'], rating: 4.9, reviews: 88, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-21', slug: 'lightweight-windbreaker', name: 'Packable Trail Windbreaker', description: 'Ultralight packable jacket with water-repellent coating and hidden chest pocket.',
    price: 115, category: 'Sport', categoryId: 'cat-3', image: img(3), images: [img(3)],
    colors: ['Sandstone', 'Black'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.6, reviews: 59, tags: [], inStock: true,
  },

  // --- Tech & Accessories (cat-4) ---
  {
    id: 'p-5', slug: 'leather-tote', name: 'Leather Tote', description: 'Vegetable-tanned leather tote with interior pockets and magnetic closure.',
    price: 220, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4), img(3)],
    colors: ['Cognac', 'Black'], sizes: ['One Size'], rating: 4.9, reviews: 67, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-11', slug: 'minimal-watch', name: 'Minimal Watch', description: 'Swiss movement watch with sapphire crystal and leather strap.',
    price: 295, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4)],
    colors: ['Silver', 'Gold'], sizes: ['One Size'], rating: 4.9, reviews: 54, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-22', slug: 'leather-laptop-sleeve', name: 'Minimalist Laptop Sleeve', description: 'Padded Italian full-grain leather sleeve with magnetic flap and soft microfiber lining.',
    price: 88, originalPrice: 115, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4)],
    colors: ['Espresso', 'Tan', 'Black'], sizes: ['13-inch', '15-inch', '16-inch'], rating: 4.8, reviews: 106, tags: ['sale'], inStock: true,
  },
  {
    id: 'p-23', slug: 'wireless-charging-tray', name: 'Catchall Wireless Charger', description: 'Weighted sandstone and leather charging tray for simultaneous phone and accessory charging.',
    price: 120, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4)],
    colors: ['Sandstone & Clay', 'Charcoal & Ink'], sizes: ['Standard Dual'], rating: 4.7, reviews: 71, tags: ['trending'], inStock: true, trending: true,
  },
  {
    id: 'p-24', slug: 'aluminum-desk-lamp', name: 'Linear Task Lamp', description: 'Anodized aluminum desk lamp with touch-sensitive dimming and warm 2700K ambient LED.',
    price: 175, category: 'Tech', categoryId: 'cat-4', image: img(4), images: [img(4)],
    colors: ['Matte Black', 'Silver'], sizes: ['One Size'], rating: 4.8, reviews: 39, tags: [], inStock: true,
  },

  // --- Home & Living (cat-5) ---
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
    id: 'p-12', slug: 'linen-sheet-set', name: 'Linen Sheet Set', description: 'Stone-washed linen sheets that get softer with every wash.',
    price: 198, originalPrice: 248, category: 'Home', categoryId: 'cat-5', image: img(2), images: [img(2)],
    colors: ['Natural', 'Grey'], sizes: ['Queen', 'King'], rating: 4.8, reviews: 112, tags: ['sale'], inStock: true,
  },
  {
    id: 'p-25', slug: 'stoneware-dinnerware-set', name: 'Artisan Dinnerware Set', description: '16-piece handcrafted stoneware dining set featuring organic rims and semi-matte glaze.',
    price: 210, category: 'Home', categoryId: 'cat-5', image: img(2), images: [img(2)],
    colors: ['Chalk White', 'Warm Oatmeal'], sizes: ['16-Piece Service for 4'], rating: 4.9, reviews: 68, tags: ['featured'], inStock: true, featured: true,
  },
  {
    id: 'p-26', slug: 'waffle-bath-towel-set', name: 'Waffle Knit Bath Set', description: 'Plush Turkish organic cotton towels with honeycombed texture for quick drying.',
    price: 92, originalPrice: 118, category: 'Home', categoryId: 'cat-5', image: img(2), images: [img(2)],
    colors: ['Sand', 'Slate', 'Clay'], sizes: ['4-Piece Set'], rating: 4.7, reviews: 95, tags: ['sale'], inStock: true,
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r-1', productId: 'p-1', author: 'Sarah M.', rating: 5, comment: 'Perfect fit and beautiful fabric. Wears beautifully all day.', createdAt: '2026-08-15' },
  { id: 'r-2', productId: 'p-1', author: 'James L.', rating: 4, comment: 'Great quality, runs slightly large. Size down if between sizes.', createdAt: '2026-07-22' },
  { id: 'r-3', productId: 'p-3', author: 'Emma K.', rating: 5, comment: 'The softest sweater I own. Worth every penny.', createdAt: '2026-08-01' },
];
