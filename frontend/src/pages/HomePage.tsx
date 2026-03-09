import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchListings, fetchCategories } from '../lib/api';
import { getCategoryColor } from '../lib/categoryColors';
import { APP_NAME } from '../lib/constants';
import ListingLogo from '../components/ListingLogo';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: listingsRes, isLoading: listingsLoading } = useQuery({
    queryKey: ['topListings'],
    queryFn: () => fetchListings({ sort: 'views', per_page: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const topListings = listingsRes?.data ?? [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <>
      <Helmet>
        <title>AI Agent Directory</title>
        <meta name="description" content="Discover and explore the best AI-first tools and infrastructure across the decentralized web. An open directory for the agentic economy." />
        <meta property="og:title" content={`${APP_NAME} | AI Agent Directory`} />
        <meta property="og:description" content="Discover and explore the best AI-first tools and infrastructure across the decentralized web." />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(55,19,236,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
            Autonomous-Agent-First Directory
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 neon-glow">
            Discover the Best <span className="text-primary italic">AI-First Tools & Infrastructure</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Discover and explore the most popular AI agents, tools, and infrastructure across the decentralized web. An open directory for the agentic economy.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-dark-surface p-2 rounded-xl shadow-2xl border border-primary/20 flex items-center gap-2">
            <div className="flex-1 flex items-center px-4 gap-3">
              <span className="material-symbols-outlined text-slate-400">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 outline-none"
                placeholder="Search tools, services, platforms..."
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-primary text-white px-6 sm:px-8 py-3 rounded-lg font-bold transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(55,19,236,0.4)] active:scale-95">
              Explore
            </button>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ease-out hover:scale-[1.05] hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(55,19,236,0.4)] active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Submit a Listing
            </Link>
            <Link
              to="/api-docs"
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ease-out hover:scale-[1.05] hover:bg-accent hover:text-dark-bg hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">api</span>
              Agent API
            </Link>
          </div>

          {/* Trending pills — real categories */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <span className="text-sm font-medium text-slate-500 mr-2 self-center">Trending:</span>
            {(categories ?? []).slice(0, 5).map(cat => (
              <Link
                key={cat.slug}
                to={`/browse?category=${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm transition-all duration-300 ease-out hover:scale-[1.05] hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_0_15px_rgba(55,19,236,0.3)] active:scale-95"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Listings Table ─────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Top Listings</h2>
            <p className="text-slate-500">The most viewed tools and services in the directory.</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-primary/20 bg-dark-surface shadow-xl">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-primary/5 border-b border-primary/20">
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tool</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reputation</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {listingsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 sm:px-6 py-5"><div className="h-4 w-6 bg-slate-800 rounded" /></td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-800" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-800 rounded" />
                          <div className="h-3 w-20 bg-slate-800/60 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-4 sm:px-6 py-5"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
                    <td className="px-4 sm:px-6 py-5"><div className="h-4 w-10 bg-slate-800 rounded" /></td>
                    <td className="px-4 sm:px-6 py-5"><div className="h-4 w-6 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : topListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No listings yet. Be the first to <Link to="/submit" className="text-primary hover:underline">submit one</Link>!
                  </td>
                </tr>
              ) : (
                topListings.map((listing, idx) => {
                  const primaryCat = listing.categories[0];
                  const catColor = primaryCat ? getCategoryColor(primaryCat.slug) : { bg: 'bg-slate-500/10', text: 'text-slate-400' };

                  return (
                    <tr
                      key={listing.id}
                      className="hover:bg-primary/5 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/listings/${listing.slug}`)}
                    >
                      <td className="px-4 sm:px-6 py-5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 sm:px-6 py-5">
                        <div className="flex items-center gap-4">
                          <ListingLogo name={listing.name} logoUrl={listing.logo_url} size="size-14" textSize="text-lg" />
                          <div>
                            <div className="font-bold text-lg group-hover:text-primary transition-colors text-white flex items-center gap-2">
                              {listing.name}
                              {listing.is_featured && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                                  <span className="material-symbols-outlined text-xs">star</span> Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                              {listing.short_description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        {primaryCat ? (
                          <span className={`${catColor.bg} ${catColor.text} text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded`}>
                            {primaryCat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-5 font-medium">
                        {listing.view_count >= 1000
                          ? `${(listing.view_count / 1000).toFixed(1)}k`
                          : listing.view_count}
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        {listing.reputation_score != null ? (
                          <span className="text-primary text-sm font-medium">{listing.reputation_score}</span>
                        ) : (
                          <span className="text-slate-500 text-sm" title="Reputation scoring coming soon.">N/A</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-5 text-right">
                        <Link
                          to={`/listings/${listing.slug}`}
                          className="text-primary hover:text-accent transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/browse"
            className="inline-block bg-primary/10 border border-primary/20 text-primary px-8 py-3 rounded-lg font-bold transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(55,19,236,0.4)] active:scale-95"
          >
            View All Listings
          </Link>
        </div>
      </section>

      {/* ── Agent-First Banner ─────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">smart_toy</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Built for Autonomous Agents</h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Every action available via REST API. Agents can discover, filter, submit, and retrieve listings programmatically -- no browser required.
            </p>
          </div>
          <Link
            to="/api-docs"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(55,19,236,0.4)] active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">api</span>
            View API Docs
          </Link>
        </div>
      </section>
    </>
  );
}
