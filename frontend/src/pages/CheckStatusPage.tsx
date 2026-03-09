import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { searchSubmissionStatus } from '../lib/api';
import { APP_NAME } from '../lib/constants';
import type { SubmissionStatusResponse } from '../types/api';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Approved' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Pending Review' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ResultCard({ result }: { result: SubmissionStatusResponse }) {
  return (
    <div className="bg-dark-surface border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{result.name}</h3>
          <p className="text-sm text-slate-500 font-mono">{result.slug}</p>
        </div>
        <StatusBadge status={result.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500">Submitted:</span>{' '}
          <span className="text-slate-300">{formatDate(result.submitted_at)}</span>
        </div>
        {result.approved_at && (
          <div>
            <span className="text-slate-500">Approved:</span>{' '}
            <span className="text-emerald-400">{formatDate(result.approved_at)}</span>
          </div>
        )}
      </div>

      {result.rejection_note && (
        <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Rejection Note</p>
          <p className="text-sm text-red-300">{result.rejection_note}</p>
        </div>
      )}

      {result.status === 'approved' && (
        <div className="mt-4">
          <Link
            to={`/listings/${result.slug}`}
            className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
          >
            View listing
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CheckStatusPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['submissionSearch', debouncedQuery],
    queryFn: () => searchSubmissionStatus(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const showResults = debouncedQuery.length >= 2;

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-12">
      <Helmet>
        <title>Check Submission Status</title>
        <meta name="description" content="Check the status of your submitted listing on AgentRadar." />
        <meta property="og:title" content={`Check Submission Status | ${APP_NAME}`} />
        <meta property="og:description" content="Check the status of your submitted listing on AgentRadar." />
        <meta property="og:type" content="website" />
      </Helmet>

      <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
        <Link className="text-slate-500 hover:text-primary transition-colors" to="/">Home</Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">Check Status</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Check Submission Status</h1>
        <p className="text-slate-400 max-w-xl">
          Enter your listing name or slug to check its review status. Results appear as you type.
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <div className="flex items-center bg-dark-surface border border-primary/20 rounded-xl px-4 py-3 gap-3 focus-within:border-primary/50 transition-colors">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter listing name or slug..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500"
            autoFocus
          />
          {isLoading && showResults && (
            <span className="material-symbols-outlined text-primary animate-spin text-xl">progress_activity</span>
          )}
        </div>
        {query.length > 0 && query.trim().length < 2 && (
          <p className="text-xs text-slate-500 mt-2">Type at least 2 characters to search</p>
        )}
      </div>

      {/* Results */}
      {!showResults && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">manage_search</span>
          <p className="text-slate-500">Start typing to search for your submission</p>
        </div>
      )}

      {showResults && !isLoading && results && results.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">search_off</span>
          <p className="text-slate-400 font-medium mb-2">No submissions found</p>
          <p className="text-slate-500 text-sm">No listings match "{debouncedQuery}". Double-check your slug or try a different search.</p>
        </div>
      )}

      {showResults && error && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
          <p className="text-red-400 font-medium">Something went wrong</p>
          <p className="text-slate-500 text-sm mt-1">Please try again in a moment.</p>
        </div>
      )}

      {showResults && results && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0 mt-0.5">info</span>
          <div className="text-sm text-slate-400 space-y-2">
            <p>
              <strong className="text-slate-300">How it works:</strong> After submitting a listing, our team reviews it.
              Approved listings appear in the directory. Rejected listings include a note explaining why.
            </p>
            <p>
              <strong className="text-slate-300">For agents:</strong> Use the API endpoint{' '}
              <code className="text-primary font-mono text-xs">GET /api/submissions/search?q=your-slug</code>{' '}
              or{' '}
              <code className="text-primary font-mono text-xs">GET /api/submissions/&lt;id-or-slug&gt;/status</code>{' '}
              to check programmatically.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
