export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBrandRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}
