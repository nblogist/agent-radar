import { Link } from 'react-router-dom';
import type { PublicListing } from '../../types/api';

interface DetailSidebarProps {
  listing: PublicListing;
}

/** Format ISO date string to human-readable form e.g. "Feb 28, 2026" */
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a number with thousands commas */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

interface MetaRowProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

function MetaRow({ icon, label, children }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
      <span className="flex items-center gap-2 text-sm text-gray-400">
        <span className="material-symbols-outlined text-base leading-none">{icon}</span>
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

/**
 * Right sidebar showing agent metadata, chain support, and a submit CTA.
 */
export default function DetailSidebar({ listing }: DetailSidebarProps) {
  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Card 1: Agent Info */}
      <div className="glass-card rounded-xl border border-dark-border p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Agent Info
        </h3>

        <MetaRow icon="calendar_today" label="Submitted">
          <span className="text-gray-300">{formatDate(listing.submitted_at)}</span>
        </MetaRow>

        <MetaRow icon="visibility" label="Views">
          <span className="text-gray-300">{formatNumber(listing.view_count)}</span>
        </MetaRow>

        <MetaRow icon="stars" label="Reputation">
          <span
            className="text-gray-500 bg-dark-surface px-2 py-0.5 rounded text-sm border border-dark-border"
            title="Reputation scoring coming soon"
          >
            N/A
          </span>
        </MetaRow>

        <MetaRow icon="check_circle" label="Status">
          <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-sm">
            Approved
          </span>
        </MetaRow>
      </div>

      {/* Card 2: Chain Support */}
      {listing.chains.length > 0 && (
        <div className="glass-card rounded-xl border border-dark-border p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Chain Support
          </h3>
          <div className="space-y-2">
            {listing.chains.map(chain => (
              <div
                key={chain.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-surface ${
                  chain.is_featured
                    ? 'border border-amber-500/30'
                    : 'border border-dark-border'
                }`}
              >
                {chain.is_featured && (
                  <span className="material-symbols-outlined text-base leading-none text-amber-400">
                    star
                  </span>
                )}
                <span className={chain.is_featured ? 'text-amber-400 font-medium' : 'text-gray-300'}>
                  {chain.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 3: Submit CTA */}
      <div className="glass-card rounded-xl border border-primary/20 p-5 text-center bg-primary/5">
        <h3 className="font-semibold mb-2">Want your agent listed?</h3>
        <p className="text-sm text-gray-400 mb-4">
          Submit your AI agent to the directory and reach a wider audience.
        </p>
        <Link
          to="/submit"
          className="bg-primary hover:scale-[1.05] active:scale-95 transition-all w-full py-2.5 rounded-lg font-semibold inline-flex items-center justify-center"
        >
          Submit Agent
        </Link>
      </div>
    </div>
  );
}
