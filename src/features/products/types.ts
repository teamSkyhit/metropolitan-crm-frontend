export type ProductStatus = 'DRAFT' | 'PUBLISHED';

export interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  description: string | null;
  price: number | null;
  priceVisibility: boolean;
  status: ProductStatus;
  hotDeal: boolean;
  imageUrl: string | null;
  specifications: ProductSpecification[] | null;
  brand: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  description?: string | null;
  price?: number | null;
  priceVisibility?: boolean;
  status?: ProductStatus;
  hotDeal?: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface UpdateProductSpecificationsRequest {
  specifications: ProductSpecification[];
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

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
