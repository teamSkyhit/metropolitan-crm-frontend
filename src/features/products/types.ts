import { PaginatedResponse } from '@/types/api';

export type ProductStatus = 'DRAFT' | 'PUBLISHED';

export interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
}

export interface ProductFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface ProductKeyBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface ProductGalleryImage {
  id: string;
  mediaId?: string | null;
  publicUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVideo {
  id: string;
  mediaId?: string | null;
  title?: string | null;
  publicUrl: string;
  sortOrder: number;
}

export interface ProductDocument {
  id: string;
  mediaId?: string | null;
  title: string;
  publicUrl: string;
  originalFileName?: string | null;
  sortOrder: number;
}

export interface RelatedProductSummary {
  id: string;
  name: string;
  slug: string;
  sku: string;
  imageUrl?: string | null;
  price?: number | null;
  priceVisibility?: boolean | string;
}

export interface ProductSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  brandId: string;
  categoryId: string;
  shortDescription?: string | null;
  description: string | null;
  overview?: string | null;
  series?: string | null;
  price: number | null;
  priceVisibility: boolean;
  status: ProductStatus;
  hotDeal: boolean;
  imageUrl: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  specifications: ProductSpecification[] | null;
  features?: ProductFeature[];
  keyBenefits?: ProductKeyBenefit[];
  gallery?: ProductGalleryImage[];
  videos?: ProductVideo[];
  documents?: ProductDocument[];
  relatedProducts?: RelatedProductSummary[];
  brand: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  category: {
    id: string;
    name: string;
    bannerUrl?: string | null;
    imageUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  shortDescription?: string | null;
  description?: string | null;
  overview?: string | null;
  series?: string | null;
  price?: number | null;
  priceVisibility?: boolean;
  status?: ProductStatus;
  hotDeal?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface UpdateProductSpecificationsRequest {
  specifications: ProductSpecification[];
}

export interface CreateProductFeatureRequest {
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface UpdateProductFeatureRequest {
  icon?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
}

export interface CreateProductKeyBenefitRequest {
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface UpdateProductKeyBenefitRequest {
  icon?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
}

export interface SetRelatedProductsRequest {
  relatedProductIds: string[];
}

export interface ReorderGalleryRequest {
  imageIds: string[];
}

export interface UpdateProductVideoRequest {
  title?: string | null;
}

export interface ReorderVideosRequest {
  videoIds: string[];
}

export interface UpdateProductDocumentRequest {
  title: string;
}

export interface ReorderDocumentsRequest {
  documentIds: string[];
}

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  hotDeal?: boolean | string;
  status?: ProductStatus;
  sortBy?: 'name' | 'sku' | 'price' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export type ProductListResponse = PaginatedResponse<Product>;
