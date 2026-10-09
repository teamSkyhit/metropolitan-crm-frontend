export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  parentId?: string;
}

import { PaginatedResponse } from '@/types/api';
export type CategoriesResponse = PaginatedResponse<Category>;

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: string | null;
}
