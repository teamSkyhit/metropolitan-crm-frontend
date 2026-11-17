export const HomepageSectionType = {
  HERO: 'HERO',
  FEATURED_PRODUCTS: 'FEATURED_PRODUCTS',
  FEATURED_CATEGORIES: 'FEATURED_CATEGORIES',
  FEATURED_BRANDS: 'FEATURED_BRANDS',
  PROMO_BANNER: 'PROMO_BANNER',
} as const;

export type HomepageSectionType = (typeof HomepageSectionType)[keyof typeof HomepageSectionType];

export interface HeroSlide {
  id?: string;
  heading: string;
  subheading?: string | null;
  mediaId: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface HeroContent {
  slides: HeroSlide[];
}

export interface FeaturedProductsContent {
  productIds: string[];
}

export interface FeaturedCategoriesContent {
  categoryIds: string[];
}

export interface FeaturedBrandsContent {
  brandIds: string[];
}

export interface PromoBannerContent {
  heading: string;
  description?: string | null;
  mediaId: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

export type HomepageContent =
  | HeroContent
  | FeaturedProductsContent
  | FeaturedCategoriesContent
  | FeaturedBrandsContent
  | PromoBannerContent;

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string | null;
  subtitle: string | null;
  content: HomepageContent;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomepageSectionRequest {
  type: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  content: HomepageContent;
}

export interface UpdateHomepageSectionRequest {
  title?: string | null;
  subtitle?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  content?: HomepageContent;
}

export interface ReorderHomepageSectionsRequest {
  items: { id: string; sortOrder: number }[];
}

export const WEBSITE_HOMEPAGE_STRUCTURE = [
  { position: 1, name: 'Hero', defaultType: HomepageSectionType.HERO },
  { position: 2, name: 'Product Categories', defaultType: HomepageSectionType.FEATURED_CATEGORIES },
  { position: 3, name: 'Featured Products', defaultType: HomepageSectionType.FEATURED_PRODUCTS },
  {
    position: 4,
    name: 'Brands (Featured Brands)',
    defaultType: HomepageSectionType.FEATURED_BRANDS,
  },
  {
    position: 5,
    name: 'Promo Banner (or any other)',
    defaultType: HomepageSectionType.PROMO_BANNER,
  },
] as const;

export function getHomepageSectionDisplayLabel(
  type: HomepageSectionType,
  title?: string | null
): string {
  if (title && title.trim()) {
    return title.trim();
  }
  switch (type) {
    case HomepageSectionType.HERO:
      return 'Hero';
    case HomepageSectionType.FEATURED_CATEGORIES:
      return 'Product Categories';
    case HomepageSectionType.FEATURED_PRODUCTS:
      return 'Featured Products';
    case HomepageSectionType.FEATURED_BRANDS:
      return 'Brands (Featured Brands)';
    case HomepageSectionType.PROMO_BANNER:
      return 'Promo Banner';
    default:
      return type;
  }
}
