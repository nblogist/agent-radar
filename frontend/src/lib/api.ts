import { API_BASE_URL } from './constants';
import type {
  PublicListing,
  Category,
  CategoryRef,
  Tag,
  Chain,
  ChainRef,
  ChainSuggestion,
  PaginatedResponse,
  ListingsQuery,
  NewListingPayload,
  SubmitResponse,
  SubmissionStatusResponse,
  AdminListing,
  AdminListingDetail,
  AdminStats,
  AdminListingsQuery,
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

// --- Submission Status ---

export async function searchSubmissionStatus(query: string): Promise<SubmissionStatusResponse[]> {
  return fetchJson<SubmissionStatusResponse[]>(
    `/api/submissions/search?q=${encodeURIComponent(query)}`,
  );
}

export async function fetchSubmissionStatus(idOrSlug: string): Promise<SubmissionStatusResponse> {
  return fetchJson<SubmissionStatusResponse>(
    `/api/submissions/${encodeURIComponent(idOrSlug)}/status`,
  );
}

// --- Admin API ---

async function adminFetch<T>(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 204) return undefined as unknown as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  admin: {
    stats: (token: string): Promise<AdminStats> =>
      adminFetch<AdminStats>(token, '/api/admin/stats'),

    listings: {
      list: (token: string, params: AdminListingsQuery = {}): Promise<PaginatedResponse<AdminListing>> => {
        const p = new URLSearchParams();
        if (params.status) p.set('status', params.status);
        if (params.search) p.set('search', params.search);
        if (params.page != null) p.set('page', String(params.page));
        if (params.per_page != null) p.set('per_page', String(params.per_page));
        const qs = p.toString();
        return adminFetch<PaginatedResponse<AdminListing>>(token, `/api/admin/listings${qs ? `?${qs}` : ''}`);
      },

      get: (token: string, id: string): Promise<AdminListingDetail> =>
        adminFetch<AdminListingDetail>(token, `/api/admin/listings/${id}`),

      approve: (token: string, id: string): Promise<AdminListing> =>
        adminFetch<AdminListing>(token, `/api/admin/listings/${id}/approve`, { method: 'POST' }),

      reject: (token: string, id: string, note?: string): Promise<AdminListing> =>
        adminFetch<AdminListing>(token, `/api/admin/listings/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ note: note ?? null }),
        }),

      update: (token: string, id: string, data: Record<string, unknown>): Promise<AdminListingDetail> =>
        adminFetch<AdminListingDetail>(token, `/api/admin/listings/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

      delete: (token: string, id: string): Promise<void> =>
        adminFetch<void>(token, `/api/admin/listings/${id}`, { method: 'DELETE' }),

      toggleFeatured: (token: string, id: string): Promise<AdminListing> =>
        adminFetch<AdminListing>(token, `/api/admin/listings/${id}/toggle-featured`, { method: 'POST' }),
    },

    categories: {
      create: (token: string, name: string): Promise<CategoryRef> =>
        adminFetch<CategoryRef>(token, '/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify({ name }),
        }),
    },

    chains: {
      create: (token: string, name: string, is_featured = false): Promise<ChainRef> =>
        adminFetch<ChainRef>(token, '/api/admin/chains', {
          method: 'POST',
          body: JSON.stringify({ name, is_featured }),
        }),
    },

    chainSuggestions: {
      list: (token: string, status?: string): Promise<ChainSuggestion[]> => {
        const p = new URLSearchParams();
        if (status) p.set('status', status);
        const qs = p.toString();
        return adminFetch<ChainSuggestion[]>(token, `/api/admin/chain-suggestions${qs ? `?${qs}` : ''}`);
      },

      approve: (token: string, id: string): Promise<ChainRef> =>
        adminFetch<ChainRef>(token, `/api/admin/chain-suggestions/${id}/approve`, { method: 'POST' }),

      reject: (token: string, id: string): Promise<void> =>
        adminFetch<void>(token, `/api/admin/chain-suggestions/${id}/reject`, { method: 'POST' }),
    },
  },
};
