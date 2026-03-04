import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAdminStore } from '../../lib/adminStore';
import type { ListingStatus } from '../../types/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-900/30 text-amber-400',
  approved: 'bg-green-900/30 text-green-400',
  rejected: 'bg-red-900/30 text-red-400',
};

const TABS: { label: string; value: ListingStatus | undefined }[] = [
  { label: 'All Submissions', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminListings() {
  const token = useAdminStore(s => s.token)!;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ListingStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionError, setActionError] = useState('');

  const onMutationError = (err: Error) => {
    setActionError(err.message || 'Action failed. Please try again.');
    setTimeout(() => setActionError(''), 5000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['adminListings', statusFilter, search, page],
    queryFn: () => api.admin.listings.list(token, { status: statusFilter, search: search || undefined, page, per_page: 20 }),
  });

  const listings = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, per_page: 20, total: 0, total_pages: 0 };

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.admin.listings.approve(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminListings'] }),
    onError: onMutationError,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => api.admin.listings.reject(token, id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      setRejectTarget(null);
      setRejectNote('');
    },
    onError: onMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.listings.delete(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminListings'] }),
    onError: onMutationError,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Submissions Management</h2>
        <p className="text-slate-400">Review and moderate listing submissions for the directory.</p>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-300 ml-4">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
        {/* Tabs + Search */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4">
            {TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`text-sm pb-4 -mb-[18px] ${
                  statusFilter === tab.value
                    ? 'font-bold text-primary border-b-2 border-primary'
                    : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="pl-9 pr-4 py-1.5 bg-slate-800/50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary w-64"
              placeholder="Search listings..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <th className="px-6 py-4">Listing Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No listings found.</td>
                </tr>
              ) : (
                listings.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/listings/${row.id}`} className="hover:text-primary transition-colors">
                        <p className="font-bold text-sm">{row.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{row.short_description}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[row.status] ?? ''}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(row.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{row.view_count}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {row.status !== 'approved' && (
                          <button
                            onClick={() => approveMutation.mutate(row.id)}
                            disabled={approveMutation.isPending}
                            className="text-xs font-bold text-emerald-500 hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {row.status !== 'rejected' && (
                          <button
                            onClick={() => setRejectTarget({ id: row.id, name: row.name })}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        )}
                        <Link to={`/admin/listings/${row.id}`} className="text-xs font-bold text-slate-400 hover:text-slate-200">
                          Edit
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this listing permanently?')) deleteMutation.mutate(row.id); }}
                          disabled={deleteMutation.isPending}
                          className="text-xs font-bold text-slate-500 hover:text-red-400 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {meta.total > 0
              ? `Showing ${(meta.page - 1) * meta.per_page + 1} to ${Math.min(meta.page * meta.per_page, meta.total)} of ${meta.total} entries`
              : 'No entries'}
          </p>
          {meta.total_pages > 1 && (
            <div className="flex gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1 px-3 border border-slate-800 rounded text-xs font-bold hover:bg-slate-800 disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(meta.total_pages, 5) }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`p-1 px-3 rounded text-xs font-bold ${
                    meta.page === i + 1 ? 'bg-primary text-white' : 'border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={meta.page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="p-1 px-3 border border-slate-800 rounded text-xs font-bold hover:bg-slate-800 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Reject Listing</h3>
            <p className="text-sm text-slate-400 mb-4">
              Rejecting <span className="text-white font-medium">{rejectTarget.name}</span>
            </p>
            <label className="block text-sm text-slate-400 mb-2">Rejection note (optional)</label>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Reason for rejection..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectTarget(null); setRejectNote(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote.trim() || undefined })}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
