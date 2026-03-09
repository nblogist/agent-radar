import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useListingsQuery } from '../hooks/useListingsQuery';
import { fetchCategories, fetchChains } from '../lib/api';
import { getCategoryColor } from '../lib/categoryColors';

import ListingLogo from '../components/ListingLogo';
import EmptyState from '../components/EmptyState';

export default function BrowsePage() {
  const { listings, meta, isLoading, error, filters, setFilter, clearFilters } = useListingsQuery();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: chains } = useQuery({ queryKey: ['chains'], queryFn: fetchChains });

  const sortOptions = [
    { label: 'Most Popular', value: 'views' },
    { label: 'Newest', value: 'newest' },
    { label: 'A–Z', value: 'alpha' },
  ];

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
      <Helmet>
        <title>Browse Directory</title>
        <meta name="description" content="Explore AI agents, tools, and services across the decentralized web." />
        <meta property="og:title" content="Browse Directory | AgentRadar" />
        <meta property="og:description" content="Explore AI agents, tools, and services across the decentralized web." />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Sidebar */}
      <aside className="w-72 border-r border-dark-border flex-col bg-dark-bg overflow-y-auto custom-scrollbar hidden lg:flex">
        <div className="p-6 space-y-8">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Navigation</h3>
            <nav className="space-y-1">
              <button
                onClick={() => clearFilters()}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  !filters.category && !filters.chain && !filters.search && filters.sort === 'newest'
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:bg-dark-surface2 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span className="text-sm font-semibold">All Listings</span>
              </button>
              <button
                onClick={() => setFilter('sort', 'views')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  filters.sort === 'views'
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:bg-dark-surface2 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
                <span className="text-sm font-medium">Trending</span>
              </button>
              <button
                onClick={() => setFilter('sort', 'newest')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  filters.sort === 'newest' && (filters.category || filters.chain || filters.search)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:bg-dark-surface2 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                <span className="text-sm font-medium">Newest</span>
              </button>
            </nav>
          </div>

          {/* Category Filter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('category', undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !filters.category ? 'text-primary font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {(categories ?? []).map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setFilter('category', cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex justify-between transition-colors ${
                    filters.category === cat.slug ? 'text-primary font-semibold bg-primary/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-600">{cat.listing_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chain Filter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chain</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('chain', undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !filters.chain ? 'text-primary font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Chains
              </button>
              {(chains ?? []).map(chain => (
                <button
                  key={chain.slug}
                  onClick={() => setFilter('chain', chain.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    filters.chain === chain.slug ? 'text-primary font-semibold bg-primary/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {chain.name}
                  {chain.is_featured && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold">Featured</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-dark-bg/30">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white leading-tight tracking-tight mb-2">Directory</h1>
            <p className="text-slate-400 text-lg">Explore the most powerful AI-first tools and services.</p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search listings by name or description..."
              value={filters.search ?? ''}
              onChange={e => setFilter('search', e.target.value || undefined)}
              className="w-full bg-dark-surface2/50 border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {filters.search && (
              <button
                onClick={() => setFilter('search', undefined)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <span className="text-sm text-slate-400">
              {isLoading ? 'Loading...' : `Showing ${meta.total} listing${meta.total !== 1 ? 's' : ''}`}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">Sort by:</span>
              <select
                value={filters.sort || 'newest'}
                onChange={e => setFilter('sort', e.target.value)}
                className="bg-dark-surface2 border-none text-sm text-white rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {error ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-red-400 mb-4">cloud_off</span>
              <h2 className="text-xl font-bold mb-2">Failed to load listings</h2>
              <p className="text-slate-400 mb-6 text-sm">Something went wrong while fetching listings. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-dark-surface2/50 border border-dark-border rounded-xl p-5 animate-pulse">
                  <div className="mb-4"><div className="size-14 rounded-xl bg-slate-800" /></div>
                  <div className="space-y-3">
                    <div className="h-5 w-3/4 bg-slate-800 rounded" />
                    <div className="h-3 w-full bg-slate-800/60 rounded" />
                    <div className="h-3 w-2/3 bg-slate-800/60 rounded" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-5 w-16 bg-slate-800 rounded" />
                    <div className="h-5 w-12 bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState searchTerm={filters.search} onClearFilters={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {listings.map(listing => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.slug}`}
                  className="bg-dark-surface2/50 border border-dark-border rounded-xl p-5 hover:border-primary/50 hover:bg-dark-surface2 transition-all group flex flex-col"
                >
                  <div className="mb-4">
                    <ListingLogo name={listing.name} logoUrl={listing.logo_url} size="size-16" textSize="text-xl" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                      {listing.name}
                      {listing.is_featured && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold shrink-0">
                          <span className="material-symbols-outlined text-xs">star</span> Featured
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {listing.short_description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.categories.map(cat => {
                      const c = getCategoryColor(cat.slug);
                      return (
                        <span key={cat.id} className={`${c.bg} ${c.text} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                          {cat.name}
                        </span>
                      );
                    })}
                    {listing.chains.filter(c => c.is_featured).map(chain => (
                      <span key={chain.id} className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {chain.name}
                      </span>
                    ))}
                  </div>

                  {listing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {listing.tags.slice(0, 3).map(tag => (
                        <span key={tag.id} className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          {tag.name}
                        </span>
                      ))}
                      {listing.tags.length > 3 && (
                        <span className="text-[10px] text-slate-600">+{listing.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-dark-border/50 mt-auto">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        {listing.view_count}
                      </span>
                      <span className="flex items-center gap-1" title={listing.reputation_score == null ? 'Reputation scoring coming soon.' : undefined}>
                        <span className="material-symbols-outlined text-sm">star</span>
                        {listing.reputation_score ?? 'N/A'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex items-center justify-center mt-12 mb-12">
              <nav className="flex items-center gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setFilter('page', String(meta.page - 1))}
                  className="size-10 flex items-center justify-center rounded-lg border border-dark-border text-slate-400 hover:bg-dark-surface2 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(meta.total_pages, 5) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setFilter('page', String(page))}
                      className={`size-10 flex items-center justify-center rounded-lg font-bold ${
                        meta.page === page
                          ? 'bg-primary text-white'
                          : 'border border-dark-border text-slate-400 hover:bg-dark-surface2 hover:text-white transition-colors'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {meta.total_pages > 5 && <span className="text-slate-600 px-2">...</span>}
                {meta.total_pages > 5 && (
                  <button
                    onClick={() => setFilter('page', String(meta.total_pages))}
                    className="size-10 flex items-center justify-center rounded-lg font-bold border border-dark-border text-slate-400 hover:bg-dark-surface2 hover:text-white transition-colors"
                  >
                    {meta.total_pages}
                  </button>
                )}
                <button
                  disabled={meta.page >= meta.total_pages}
                  onClick={() => setFilter('page', String(meta.page + 1))}
                  className="size-10 flex items-center justify-center rounded-lg border border-dark-border text-slate-400 hover:bg-dark-surface2 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
