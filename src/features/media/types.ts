export interface Media {
  id: string;
  fileName: string;
  storageKey: string;
  publicUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
}
