import { PaginatedResponse } from '@/types/api';

export interface IndustrialCapability {
  id: string;
  number?: string | null;
  title: string;
  slug: string;
  imageUrl?: string | null;
  imageMediaId?: string | null;
  icon?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  typicalProducts: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IndustrialCapabilitiesResponse = PaginatedResponse<IndustrialCapability>;

export interface IndustrialCapabilityQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'title' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIndustrialCapabilityRequest {
  number?: string | null;
  title: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  typicalProducts?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateIndustrialCapabilityRequest {
  number?: string | null;
  title?: string;
  slug?: string;
  imageUrl?: string | null;
  icon?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  typicalProducts?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReorderIndustrialCapabilitiesRequest {
  capabilityIds: string[];
}

export interface IndustrialCapabilitySectionSettings {
  eyebrow: string;
  title: string;
  description: string;
}

export interface UpdateIndustrialCapabilitySectionSettingsRequest {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
}
