import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  LucideAngularModule,
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  ShoppingBag,
  Star,
  Tag,
  Heart,
  User,
  Users,
  Gift,
  Flame,
  Crown,
  Layers,
  CheckCircle2,
} from 'lucide-angular';
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { PageTitleService } from '../../../core/services/page-title.service';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { QuizAnswers, rankProducts } from './recommendation.service';

interface OptionCard<T> {
  value: T;
  title: string;
  description: string;
  icon?: typeof User;
  badge?: string;
}

@Component({
  selector: 'app-product-finder',
  imports: [RouterLink, LucideAngularModule, ProductCardComponent],
  templateUrl: './product-finder.component.html',
  styleUrl: './product-finder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFinderComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(PageTitleService);

  readonly icons = {
    Compass,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Check,
    RotateCcw,
    ShoppingBag,
    Star,
    Tag,
    Heart,
    User,
    Users,
    Gift,
    Flame,
    Crown,
    Layers,
    CheckCircle2,
  };

  // Step state (1 to 5, then completed/results)
  readonly currentStep = signal<number>(1);
  readonly isCompleted = signal<boolean>(false);

  // User's quiz answers
  readonly answers = signal<QuizAnswers>({
    recipient: '',
    category: '',
    categoryName: '',
    style: '',
    budget: '',
    priority: '',
  });

  // Repository-driven catalog data
  readonly rawCategories = toSignal(this.categoryRepo.list(), { initialValue: [] });
  readonly products = toSignal(
    this.productRepo.list({ pageSize: 100 }).pipe(map((res) => res.items)),
    { initialValue: [] },
  );

  // Derived dynamic category options from actual CategoryRepository
  readonly categoryOptions = computed(() => {
    const cats = this.rawCategories();
    const options = [
      {
        value: 'all',
        title: 'All Categories',
        description: 'Explore pieces across our complete collection',
        image: '',
        productCount: this.products().length,
      },
      ...cats.map((c) => ({
        value: c.id,
        title: c.name,
        description: c.description,
        image: c.image,
        productCount: c.productCount,
      })),
    ];
    return options;
  });

  // Static options for steps 1, 3, 4, 5
  readonly recipientOptions: OptionCard<QuizAnswers['recipient']>[] = [
    {
      value: 'myself',
      title: 'Myself',
      description: 'Curating pieces for my personal wardrobe and home lifestyle',
      icon: User,
    },
    {
      value: 'partner',
      title: 'Partner',
      description: 'An intimate, thoughtful piece for someone special',
      icon: Heart,
    },
    {
      value: 'family',
      title: 'Family',
      description: 'Warm, dependable essentials for loved ones and household living',
      icon: Users,
    },
    {
      value: 'gift',
      title: 'A Gift',
      description: 'A beautifully crafted, memorable item for an upcoming occasion',
      icon: Gift,
    },
  ];

  readonly styleOptions: OptionCard<QuizAnswers['style']>[] = [
    {
      value: 'minimal',
      title: 'Minimal',
      description: 'Quiet tones, clean lines, and purposeful simplicity',
      badge: 'Understated',
    },
    {
      value: 'classic',
      title: 'Classic',
      description: 'Timeless tailoring, refined essentials, and heritage craft',
      badge: 'Timeless',
    },
    {
      value: 'modern',
      title: 'Modern',
      description: 'Contemporary silhouettes, tactile innovation, and sleek utility',
      badge: 'Elevated',
    },
    {
      value: 'bold',
      title: 'Bold',
      description: 'Expressive cuts, rich textures, and statement focal pieces',
      badge: 'Statement',
    },
    {
      value: 'any',
      title: 'No Preference',
      description: 'Open to a balanced mix of design aesthetics',
      badge: 'Flexible',
    },
  ];

  readonly budgetOptions: OptionCard<QuizAnswers['budget']>[] = [
    {
      value: 'under-75',
      title: 'Under $75',
      description: 'Everyday essentials, apothecary, and considered design accents',
    },
    {
      value: '75-150',
      title: '$75 — $150',
      description: 'Core lifestyle staples, premium knitwear, and daily accessories',
    },
    {
      value: '150-plus',
      title: '$150 and above',
      description: 'Investment tailoring, heirloom materials, and luxury pieces',
    },
    {
      value: 'any',
      title: 'Flexible / Any Budget',
      description: 'Showcase the best recommendations regardless of price point',
    },
  ];

  readonly priorityOptions: OptionCard<QuizAnswers['priority']>[] = [
    {
      value: 'best-value',
      title: 'Best Value',
      description: 'Pieces offering maximum quality or notable current sale offers',
      icon: Tag,
    },
    {
      value: 'most-popular',
      title: 'Most Popular',
      description: 'Top-rated favorites with verified positive customer reviews',
      icon: Star,
    },
    {
      value: 'premium',
      title: 'Premium Choice',
      description: 'Finest materials, luxury finishes, and distinctive craftsmanship',
      icon: Crown,
    },
    {
      value: 'trending',
      title: 'Trending Now',
      description: 'Current season highlights and newly celebrated designs',
      icon: Flame,
    },
    {
      value: 'any',
      title: 'Balanced Selection',
      description: 'The most harmonious overall match for all selected preferences',
      icon: Layers,
    },
  ];

  // Progress Calculation
  readonly progressPercent = computed(() => {
    if (this.isCompleted()) return 100;
    return (this.currentStep() / 5) * 100;
  });

  // Check if current step has a valid selection
  readonly canContinue = computed(() => {
    const a = this.answers();
    switch (this.currentStep()) {
      case 1:
        return !!a.recipient;
      case 2:
        return !!a.category;
      case 3:
        return !!a.style;
      case 4:
        return !!a.budget;
      case 5:
        return !!a.priority;
      default:
        return false;
    }
  });

  // Results calculation
  readonly results = computed(() => {
    if (!this.isCompleted()) return null;
    return rankProducts(this.answers(), this.products());
  });

  // Personalized summary based on chosen answers
  readonly personalizedSummary = computed(() => {
    const a = this.answers();
    const catLabel = a.categoryName || (a.category === 'all' ? 'all collections' : 'your chosen collection');
    let budgetLabel = 'any price range';
    if (a.budget === 'under-75') budgetLabel = 'under $75';
    else if (a.budget === '75-150') budgetLabel = '$75 to $150';
    else if (a.budget === '150-plus') budgetLabel = '$150 and above';

    let priorityLabel = 'overall quality';
    if (a.priority === 'best-value') priorityLabel = 'exceptional value';
    else if (a.priority === 'most-popular') priorityLabel = 'community popularity';
    else if (a.priority === 'premium') priorityLabel = 'luxury craftsmanship';
    else if (a.priority === 'trending') priorityLabel = 'trending highlights';

    return `Based on your preference for ${catLabel}, budget of ${budgetLabel}, and focus on ${priorityLabel}, we curated these recommendations for you.`;
  });

  constructor() {
    this.pageTitle.set('Product Finder | Salla');
  }

  // Answer selection handlers
  selectRecipient(val: QuizAnswers['recipient']): void {
    this.answers.update((prev) => ({ ...prev, recipient: val }));
  }

  selectCategory(id: string, name: string): void {
    this.answers.update((prev) => ({ ...prev, category: id, categoryName: name }));
  }

  selectStyle(val: QuizAnswers['style']): void {
    this.answers.update((prev) => ({ ...prev, style: val }));
  }

  selectBudget(val: QuizAnswers['budget']): void {
    this.answers.update((prev) => ({ ...prev, budget: val }));
  }

  selectPriority(val: QuizAnswers['priority']): void {
    this.answers.update((prev) => ({ ...prev, priority: val }));
  }

  // Navigation handlers
  next(): void {
    if (!this.canContinue()) return;
    if (this.currentStep() < 5) {
      this.currentStep.update((s) => s + 1);
      this.scrollToTop();
    } else {
      this.submitQuiz();
    }
  }

  prev(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
      this.scrollToTop();
    }
  }

  submitQuiz(): void {
    this.isCompleted.set(true);
    this.scrollToTop();
  }

  retakeQuiz(): void {
    this.answers.set({
      recipient: '',
      category: '',
      categoryName: '',
      style: '',
      budget: '',
      priority: '',
    });
    this.currentStep.set(1);
    this.isCompleted.set(false);
    this.scrollToTop();
  }

  browseCatalog(): void {
    this.router.navigate(['/category']);
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
