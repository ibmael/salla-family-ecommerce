import { Product } from '../../../core/models/product.model';

export interface QuizAnswers {
  recipient: 'myself' | 'partner' | 'family' | 'gift' | '';
  category: string; // 'all' or categoryId / slug
  categoryName?: string;
  style: 'minimal' | 'classic' | 'modern' | 'bold' | 'any' | '';
  budget: 'under-75' | '75-150' | '150-plus' | 'any' | '';
  priority: 'best-value' | 'most-popular' | 'premium' | 'trending' | 'any' | '';
}

export interface RecommendationResult {
  bestMatch: Product | null;
  recommendations: Product[];
  isRelaxed: boolean;
  totalMatches: number;
}

const SCORING = {
  IN_STOCK_BONUS: 25,
  OUT_OF_STOCK_PENALTY: -60,
  CATEGORY_MATCH: 35,
  CATEGORY_MISMATCH_PENALTY: -25,
  CATEGORY_ALL_BONUS: 15,
  BUDGET_MATCH: 30,
  BUDGET_CLOSE_MATCH: 10,
  BUDGET_MARGINAL_MATCH: 5,
  BUDGET_MISMATCH_PENALTY: -25,
  BUDGET_ALL_FALLBACK: 15,
  ON_SALE_BONUS: 20,
  SALE_TAG_BONUS: 10,
  HIGH_RATING_BONUS: 15,
  GOOD_RATING_BONUS: 10,
  FEATURED_BONUS: 12,
  TRENDING_FLAG_BONUS: 25,
  TRENDING_TAG_BONUS: 15,
  STYLE_KEYWORD_MATCH: 8,
  RECIPIENT_KEYWORD_MATCH: 8,
} as const;

/**
 * Pure, deterministic recommendation algorithm that ranks existing catalog products
 * based on the user's quiz answers. Never mutates input product data.
 */
export function rankProducts(
  answers: QuizAnswers,
  products: readonly Product[]
): RecommendationResult {
  if (!products || products.length === 0) {
    return {
      bestMatch: null,
      recommendations: [],
      isRelaxed: false,
      totalMatches: 0,
    };
  }

  const scored = products.map((product) => {
    let score = 0;

    // 1. Availability (Strong signal: strongly favor in-stock products)
    if (product.inStock) {
      score += SCORING.IN_STOCK_BONUS;
    } else {
      score += SCORING.OUT_OF_STOCK_PENALTY;
    }

    // 2. Category matching (Strong signal)
    if (!answers.category || answers.category === 'all') {
      score += SCORING.CATEGORY_ALL_BONUS;
    } else {
      const matchId = product.categoryId === answers.category;
      const matchSlug = product.category.toLowerCase() === answers.category.toLowerCase();
      if (matchId || matchSlug) {
        score += SCORING.CATEGORY_MATCH;
      } else {
        score += SCORING.CATEGORY_MISMATCH_PENALTY;
      }
    }

    // 3. Budget matching (Strong signal based on actual catalog pricing)
    const price = product.price;
    if (answers.budget === 'under-75') {
      if (price <= 75) {
        score += SCORING.BUDGET_MATCH;
      } else if (price <= 90) {
        score += SCORING.BUDGET_MARGINAL_MATCH;
      } else {
        score += SCORING.BUDGET_MISMATCH_PENALTY;
      }
    } else if (answers.budget === '75-150') {
      if (price >= 75 && price <= 150) {
        score += SCORING.BUDGET_MATCH;
      } else if (price >= 60 && price < 75) {
        score += SCORING.BUDGET_CLOSE_MATCH;
      } else if (price > 150 && price <= 175) {
        score += SCORING.BUDGET_MARGINAL_MATCH;
      } else {
        score += SCORING.BUDGET_MISMATCH_PENALTY;
      }
    } else if (answers.budget === '150-plus') {
      if (price >= 150) {
        score += SCORING.BUDGET_MATCH;
      } else if (price >= 120 && price < 150) {
        score += SCORING.BUDGET_CLOSE_MATCH;
      } else {
        score += SCORING.BUDGET_MISMATCH_PENALTY;
      }
    } else {
      score += SCORING.BUDGET_ALL_FALLBACK;
    }

    // 4. What matters most / Priority (Soft signal)
    if (answers.priority === 'best-value') {
      if (product.originalPrice && product.originalPrice > product.price) {
        score += SCORING.ON_SALE_BONUS;
      }
      if (product.tags?.includes('sale')) {
        score += SCORING.SALE_TAG_BONUS;
      }
      if (product.price > 0) {
        score += Math.min(10, Math.round((product.rating / product.price) * 100));
      }
    } else if (answers.priority === 'most-popular') {
      if (product.rating >= 4.8) score += SCORING.HIGH_RATING_BONUS;
      else if (product.rating >= 4.6) score += SCORING.GOOD_RATING_BONUS;
      score += Math.min(15, Math.round((product.reviews || 0) / 12));
    } else if (answers.priority === 'premium') {
      if (product.featured) score += SCORING.FEATURED_BONUS;
      if (product.price >= 140) score += 15;
      const desc = `${product.name} ${product.description}`.toLowerCase();
      if (['cashmere', 'wool', 'leather', 'silk', 'linen', 'italian', 'european', 'gold'].some((m) => desc.includes(m))) {
        score += SCORING.STYLE_KEYWORD_MATCH;
      }
    } else if (answers.priority === 'trending') {
      if (product.trending) score += SCORING.TRENDING_FLAG_BONUS;
      if (product.tags?.includes('trending')) score += SCORING.TRENDING_TAG_BONUS;
    } else {
      score += Math.round(product.rating * 3) + (product.featured ? 6 : 0) + (product.trending ? 6 : 0);
    }

    // 5. Style preference (Soft signal inferred from descriptive keywords)
    const text = `${product.name} ${product.description} ${product.tags?.join(' ') || ''}`.toLowerCase();
    if (answers.style === 'minimal') {
      if (['minimal', 'clean', 'linen', 'neutral', 'cashmere', 'relaxed', 'tote', 'watch', 'sleeve'].some((k) => text.includes(k))) {
        score += SCORING.STYLE_KEYWORD_MATCH;
      }
    } else if (answers.style === 'classic') {
      if (['classic', 'blazer', 'trench', 'oxford', 'trouser', 'wool', 'leather', 'tailored'].some((k) => text.includes(k))) {
        score += SCORING.STYLE_KEYWORD_MATCH;
      }
    } else if (answers.style === 'modern') {
      if (['modern', 'tech', 'lamp', 'charging', 'seamless', 'active', 'studio', 'mat', 'windbreaker'].some((k) => text.includes(k))) {
        score += SCORING.STYLE_KEYWORD_MATCH;
      }
    } else if (answers.style === 'bold') {
      if (['statement', 'botanical', 'satin', 'dress', 'amber', 'sculpting', 'fluid', 'rose quartz'].some((k) => text.includes(k))) {
        score += SCORING.STYLE_KEYWORD_MATCH;
      }
    }

    // 6. Recipient affinity (Soft signal)
    if (answers.recipient === 'gift') {
      if (['candle', 'scarf', 'wrap', 'vase', 'watch', 'salts', 'gua sha', 'charger'].some((k) => text.includes(k))) {
        score += SCORING.RECIPIENT_KEYWORD_MATCH;
      }
    } else if (answers.recipient === 'partner') {
      if (['candle', 'wrap', 'watch', 'oil', 'dress', 'blazer'].some((k) => text.includes(k))) {
        score += 6;
      }
    } else if (answers.recipient === 'family') {
      if (['home', 'blanket', 'throw', 'sheet', 'candle', 'vase', 'mat'].some((k) => text.includes(k))) {
        score += 6;
      }
    }

    return { product, score };
  });

  // Sort candidate products descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take positive scoring in-stock products first
  const validMatches = scored
    .filter((s) => s.score > 20 && s.product.inStock)
    .map((s) => s.product);

  let isRelaxed = false;
  let finalProducts: Product[] = [];

  if (validMatches.length >= 2) {
    finalProducts = validMatches;
  } else {
    // Progressive relaxation: fallback to closest available products
    isRelaxed = true;
    const inStock = scored.filter((s) => s.product.inStock).map((s) => s.product);
    finalProducts = inStock.length > 0 ? inStock : scored.map((s) => s.product);
  }

  // Deduplicate products using a Set of IDs
  const uniqueProducts: Product[] = [];
  const seenIds = new Set<string>();
  for (const p of finalProducts) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      uniqueProducts.push(p);
    }
  }

  const bestMatch = uniqueProducts[0] || null;
  const recommendations = uniqueProducts.slice(1, 7);

  return {
    bestMatch,
    recommendations,
    isRelaxed,
    totalMatches: uniqueProducts.length,
  };
}
