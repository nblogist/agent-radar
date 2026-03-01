// TypeScript interfaces that mirror the backend Rust response structs exactly.
// Field names use snake_case to match serde JSON serialization from Rust.

export interface CategoryRef {
  id: string;   // UUID as string
  name: string;
  slug: string;
}

export interface TagRef {
  id: string;
  name: string;
  slug: string;
}

export interface ChainRef {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
}

export interface PublicListing {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  logo_url: string | null;
  website_url: string;
  github_url: string | null;
  docs_url: string | null;
  api_endpoint_url: string | null;
  reputation_score: number | null;
  view_count: number;
  submitted_at: string;     // ISO date string
  approved_at: string | null;
  categories: CategoryRef[];
  tags: TagRef[];
  chains: ChainRef[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  listing_count: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  listing_count: number;
}

export interface Chain {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Query params for listings endpoint
export interface ListingsQuery {
  search?: string;
  category?: string;
  tag?: string;
  chain?: string;
  sort?: 'newest' | 'views' | 'alpha';
  page?: number;
  per_page?: number;
}

// --- Submit Flow Types ---

export interface NewListingPayload {
  name: string;
  short_description: string;
  description: string;
  logo_url?: string;
  website_url: string;
  github_url?: string;
  docs_url?: string;
  api_endpoint_url?: string;
  contact_email: string;
  categories: string[];  // UUID strings
  tags: string[];
  chains: string[];      // UUID strings
}

export interface SubmitResponse {
  id: string;
  slug: string;
  status: string;
  submitted_at: string;
}
