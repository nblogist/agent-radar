import { API_BASE_URL } from './constants';
import type {
  PublicListing,
  Category,
  Tag,
  Chain,
  PaginatedResponse,
  ListingsQuery,
  NewListingPayload,
  SubmitResponse,
} from '../types/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchListings(
  query: ListingsQuery = {},
): Promise<PaginatedResponse<PublicListing>> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.tag) params.set('tag', query.tag);
  if (query.chain) params.set('chain', query.chain);
  if (query.sort) params.set('sort', query.sort);
  if (query.page != null) params.set('page', String(query.page));
  if (query.per_page != null) params.set('per_page', String(query.per_page));
  const qs = params.toString();
  return fetchJson<PaginatedResponse<PublicListing>>(
    `/api/listings${qs ? `?${qs}` : ''}`,
  );
}

export async function fetchListing(slug: string): Promise<PublicListing> {
  return fetchJson<PublicListing>(`/api/listings/${encodeURIComponent(slug)}`);
}

export async function fetchCategories(): Promise<Category[]> {
  return fetchJson<Category[]>('/api/categories');
}

export async function fetchTags(): Promise<Tag[]> {
  return fetchJson<Tag[]>('/api/tags');
}

export async function fetchChains(): Promise<Chain[]> {
  return fetchJson<Chain[]>('/api/chains');
}

export async function submitListing(payload: NewListingPayload): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<SubmitResponse>;
}
