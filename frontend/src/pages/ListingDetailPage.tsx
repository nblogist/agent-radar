import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchListing, ApiError } from '../lib/api';
import { getCategoryColor } from '../lib/categoryColors';
import { APP_NAME } from '../lib/constants';
import ListingLogo from '../components/ListingLogo';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => fetchListing(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-8 animate-pulse">
        <div className="h-4 w-48 bg-slate-800 rounded mb-8" />
        <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
          <div className="size-32 rounded-xl bg-slate-800" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-64 bg-slate-800 rounded" />
            <div className="h-4 w-96 bg-slate-800/60 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded" />
            <div className="h-40 bg-slate-800/40 rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-48 bg-slate-800/40 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">{is404 ? 'error_outline' : 'cloud_off'}</span>
        <h1 className="text-3xl font-bold mb-2">{is404 ? 'Listing Not Found' : 'Failed to Load'}</h1>
        <p className="text-slate-400 mb-8">
          {is404
            ? "The listing you're looking for doesn't exist or has been removed."
            : 'Something went wrong. Please check your connection and try again.'}
        </p>
        {is404 ? (
          <Link to="/browse" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            Browse Directory
          </Link>
        ) : (
          <button onClick={() => window.location.reload()} className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            Retry
          </button>
        )}
      </main>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-8">
      <Helmet>
        <title>{listing.name} | {APP_NAME}</title>
        <meta name="description" content={listing.short_description} />
        <meta property="og:title" content={`${listing.name} | ${APP_NAME}`} />
        <meta property="og:description" content={listing.short_description} />
        <meta property="og:type" content="website" />
        {listing.logo_url && <meta property="og:image" content={listing.logo_url} />}
      </Helmet>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
        <Link className="text-slate-500 hover:text-primary transition-colors" to="/">Home</Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <Link className="text-slate-500 hover:text-primary transition-colors" to="/browse">Directory</Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">{listing.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="bg-primary/10 rounded-2xl p-1 border-2 border-primary/20">
            <ListingLogo
              name={listing.name}
              logoUrl={listing.logo_url}
              size="size-32"
              textSize="text-4xl"
              rounded="rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-white text-4xl font-bold tracking-tight mb-2">
              {listing.name}
              {listing.is_featured && (
                <span className="ml-3 align-middle inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">star</span> Featured
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-lg mb-4">{listing.short_description}</p>
            <div className="flex flex-wrap gap-2">
              {listing.categories.map(cat => {
                const c = getCategoryColor(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    to={`/browse?category=${cat.slug}`}
                    className={`px-3 py-1 rounded-full ${c.bg} ${c.text} text-xs font-semibold hover:opacity-80 transition-opacity`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
              {listing.chains.map(chain => (
                <Link
                  key={chain.id}
                  to={`/browse?chain=${chain.slug}`}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    chain.is_featured
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-slate-800 text-slate-300'
                  } hover:opacity-80 transition-opacity`}
                >
                  {chain.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {listing.api_endpoint_url && (
            <a
              href={listing.api_endpoint_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-accent text-dark-bg text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,242,255,0.2)]"
            >
              <span className="material-symbols-outlined text-lg">api</span> API Endpoint
            </a>
          )}
          <a
            href={listing.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">language</span> Website
          </a>
          {listing.docs_url && (
            <a
              href={listing.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">description</span> Docs
            </a>
          )}
          {listing.github_url && (
            <a
              href={listing.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">code</span> GitHub
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* About Section */}
          <section>
            <h3 className="text-xl font-bold mb-4">About {listing.name}</h3>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
              <MarkdownRenderer content={listing.description} />
            </div>
          </section>

          {/* Tags Section */}
          {listing.tags.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/browse?tag=${tag.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Content Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span> Quick Info
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Views</span>
                <span className="text-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-slate-400">visibility</span>
                  {listing.view_count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Reputation</span>
                {listing.reputation_score != null ? (
                  <span className="text-sm font-bold text-primary">{listing.reputation_score}</span>
                ) : (
                  <span className="text-sm text-slate-500" title="Reputation scoring coming soon.">N/A</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Submitted</span>
                <span className="text-sm text-slate-300">
                  {new Date(listing.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {listing.approved_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Approved</span>
                  <span className="text-sm text-slate-300">
                    {new Date(listing.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {listing.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Updated</span>
                  <span className="text-sm text-slate-300">
                    {new Date(listing.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {listing.api_endpoint_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">API Endpoint</span>
                  <a href={listing.api_endpoint_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline truncate ml-4 font-medium">
                    Endpoint
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* CTA Ad Card */}
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white text-center shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-4xl mb-3">auto_awesome</span>
            <h5 className="text-lg font-bold mb-2">Want your tool listed?</h5>
            <p className="text-white/80 text-sm mb-4">Reach crypto-native developers and builders.</p>
            <Link to="/submit" className="block w-full bg-white text-primary font-bold py-3 rounded-lg text-sm hover:bg-opacity-90 transition-all">
              Submit a Listing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
