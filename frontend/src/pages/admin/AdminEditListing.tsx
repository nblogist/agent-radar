import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetchCategories, fetchChains } from '../../lib/api';
import { useAdminStore } from '../../lib/adminStore';
import { getCategoryColor } from '../../lib/categoryColors';
import ListingLogo from '../../components/ListingLogo';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import type { CategoryRef, ChainRef } from '../../types/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-900/30 text-amber-400',
  approved: 'bg-green-900/30 text-green-400',
  rejected: 'bg-red-900/30 text-red-400',
};

const inputClass = 'w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500';

export default function AdminEditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAdminStore(s => s.token)!;
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['adminListing', id],
    queryFn: () => api.admin.listings.get(token, id!),
    enabled: !!id,
  });

  // Fetch all available categories and chains for edit mode
  const { data: allCategories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: allChains } = useQuery({ queryKey: ['chains'], queryFn: fetchChains });

  // Editable fields
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editDocsUrl, setEditDocsUrl] = useState('');
  const [editApiEndpointUrl, setEditApiEndpointUrl] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [editChainIds, setEditChainIds] = useState<string[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newChainName, setNewChainName] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  function startEditing() {
    if (!listing) return;
    setEditName(listing.name);
    setEditShortDesc(listing.short_description);
    setEditDesc(listing.description);
    setEditWebsiteUrl(listing.website_url);
    setEditLogoUrl(listing.logo_url ?? '');
    setEditGithubUrl(listing.github_url ?? '');
    setEditDocsUrl(listing.docs_url ?? '');
    setEditApiEndpointUrl(listing.api_endpoint_url ?? '');
    setEditContactEmail(listing.contact_email);
    setEditCategoryIds(listing.categories.map(c => c.id));
    setEditChainIds(listing.chains.map(c => c.id));
    setEditTags(listing.tags.map(t => t.name));
    setTagInput('');
    setNewCatName('');
    setNewChainName('');
    setEditing(true);
  }

  function toggleCategory(catId: string) {
    setEditCategoryIds(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  }

  function toggleChain(chainId: string) {
    setEditChainIds(prev => prev.includes(chainId) ? prev.filter(c => c !== chainId) : [...prev, chainId]);
  }

  function addTag(raw: string) {
    const tag = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (tag && !editTags.includes(tag)) setEditTags(prev => [...prev, tag]);
    setTagInput('');
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && editTags.length > 0) {
      setEditTags(prev => prev.slice(0, -1));
    }
  }

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.admin.categories.create(token, name),
    onSuccess: (cat: CategoryRef) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditCategoryIds(prev => [...prev, cat.id]);
      setNewCatName('');
    },
  });

  const createChainMutation = useMutation({
    mutationFn: (name: string) => api.admin.chains.create(token, name),
    onSuccess: (chain: ChainRef) => {
      queryClient.invalidateQueries({ queryKey: ['chains'] });
      setEditChainIds(prev => [...prev, chain.id]);
      setNewChainName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.admin.listings.update(token, id!, {
      name: editName,
      short_description: editShortDesc,
      description: editDesc,
      website_url: editWebsiteUrl,
      logo_url: editLogoUrl || null,
      github_url: editGithubUrl || null,
      docs_url: editDocsUrl || null,
      api_endpoint_url: editApiEndpointUrl || null,
      contact_email: editContactEmail,
      categories: editCategoryIds,
      tags: editTags,
      chains: editChainIds,
    }),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['adminListing', id] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => api.admin.listings.approve(token, id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminListing', id] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.admin.listings.reject(token, id!, rejectNote || undefined),
    onSuccess: () => {
      setShowRejectModal(false);
      setRejectNote('');
      queryClient.invalidateQueries({ queryKey: ['adminListing', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.listings.delete(token, id!),
    onSuccess: () => navigate('/admin/dashboard'),
  });

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  if (error) {
    const is404 = error instanceof Error && 'status' in error && (error as { status: number }).status === 404;
    return (
      <div className="p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">{is404 ? 'error_outline' : 'cloud_off'}</span>
        <h2 className="text-xl font-bold mb-2">{is404 ? 'Listing Not Found' : 'Failed to Load'}</h2>
        <p className="text-slate-400 text-sm mb-4">{is404 ? '' : 'Something went wrong. Please try again.'}</p>
        <Link to="/admin/dashboard" className="text-primary hover:underline text-sm">Back to Listings</Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">error_outline</span>
        <h2 className="text-xl font-bold mb-2">Listing Not Found</h2>
        <Link to="/admin/dashboard" className="text-primary hover:underline text-sm">Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black tracking-tight">{listing.name}</h2>
          <p className="text-sm text-slate-400">{listing.slug}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[listing.status] ?? ''}`}>
          {listing.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {listing.status !== 'approved' && (
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {listing.status !== 'rejected' && (
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
          >
            Reject
          </button>
        )}
        <button
          onClick={() => editing ? updateMutation.mutate() : startEditing()}
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          {editing ? 'Save Changes' : 'Edit'}
        </button>
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-slate-400 text-sm font-bold hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => { if (confirm('Delete this listing permanently?')) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50 ml-auto"
        >
          Delete
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">Reject Listing</h3>
            <textarea
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 min-h-[100px]"
              placeholder="Rejection reason (optional)"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">Listing Details</h3>
            <div className="flex items-start gap-4">
              {editing ? (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <ListingLogo name={editName || listing.name} logoUrl={editLogoUrl || null} size="size-16" textSize="text-xl" />
                  <label className="text-[10px] text-slate-500 cursor-pointer hover:text-primary transition-colors flex items-center gap-0.5">
                    <span className="material-symbols-outlined !text-[10px]">edit</span>
                    Logo
                  </label>
                </div>
              ) : (
                <ListingLogo name={listing.name} logoUrl={listing.logo_url} size="size-16" textSize="text-xl" />
              )}
              <div className="flex-1 space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Name</label>
                      <input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Short Description</label>
                      <input className={inputClass} value={editShortDesc} onChange={e => setEditShortDesc(e.target.value)} maxLength={140} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description <span className="text-slate-600 font-normal">(Markdown supported)</span></label>
                      <textarea className={`${inputClass} min-h-[120px]`} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Logo URL <span className="text-slate-600 font-normal">(leave empty for auto-generated)</span></label>
                      <input className={inputClass} type="url" placeholder="https://example.com/logo.png" value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-slate-500">Short Description</p>
                      <p className="text-sm">{listing.short_description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Full Description</p>
                      <MarkdownRenderer content={listing.description} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">URLs</h3>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Website URL</label>
                  <input className={inputClass} type="url" value={editWebsiteUrl} onChange={e => setEditWebsiteUrl(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">GitHub URL</label>
                  <input className={inputClass} type="url" placeholder="https://github.com/..." value={editGithubUrl} onChange={e => setEditGithubUrl(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Docs URL</label>
                  <input className={inputClass} type="url" placeholder="https://docs.example.com" value={editDocsUrl} onChange={e => setEditDocsUrl(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">API Endpoint</label>
                  <input className={inputClass} type="url" placeholder="https://api.example.com" value={editApiEndpointUrl} onChange={e => setEditApiEndpointUrl(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Website</p>
                  <a href={listing.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{listing.website_url}</a>
                </div>
                {listing.github_url && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">GitHub</p>
                    <a href={listing.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{listing.github_url}</a>
                  </div>
                )}
                {listing.docs_url && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Docs</p>
                    <a href={listing.docs_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{listing.docs_url}</a>
                  </div>
                )}
                {listing.api_endpoint_url && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">API Endpoint</p>
                    <a href={listing.api_endpoint_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{listing.api_endpoint_url}</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories, Tags, Chains */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">Classification</h3>
            {editing ? (
              <div className="space-y-5">
                {/* Categories — toggle from all available */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {(allCategories ?? []).map(cat => {
                      const selected = editCategoryIds.includes(cat.id);
                      const c = getCategoryColor(cat.slug);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded transition-all ${
                            selected
                              ? `${c.bg} ${c.text} ring-1 ring-current`
                              : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {/* Inline add new category */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      className={`${inputClass} !w-auto flex-1 max-w-[200px] text-xs`}
                      placeholder="New category name..."
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newCatName.trim()) { e.preventDefault(); createCategoryMutation.mutate(newCatName.trim()); } }}
                    />
                    <button
                      type="button"
                      disabled={!newCatName.trim() || createCategoryMutation.isPending}
                      onClick={() => createCategoryMutation.mutate(newCatName.trim())}
                      className="text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-40 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Add
                    </button>
                  </div>
                </div>

                {/* Tags — chip input */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2 p-2.5 bg-dark-bg border border-white/10 rounded-lg min-h-[40px] items-center">
                    {editTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
                          <span className="material-symbols-outlined !text-[10px]">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      className="flex-1 min-w-[100px] bg-transparent border-none focus:ring-0 text-xs text-slate-100 placeholder-slate-500 outline-none"
                      placeholder={editTags.length === 0 ? 'Type and press Enter...' : ''}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput) addTag(tagInput); }}
                    />
                  </div>
                </div>

                {/* Chains — toggle from all available */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Chains</p>
                  <div className="flex flex-wrap gap-2">
                    {(allChains ?? []).map(chain => {
                      const selected = editChainIds.includes(chain.id);
                      return (
                        <button
                          key={chain.id}
                          type="button"
                          onClick={() => toggleChain(chain.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded transition-all ${
                            selected
                              ? chain.is_featured
                                ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50'
                                : 'bg-primary/10 text-primary ring-1 ring-primary/50'
                              : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {chain.name}
                        </button>
                      );
                    })}
                  </div>
                  {/* Inline add new chain */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      className={`${inputClass} !w-auto flex-1 max-w-[200px] text-xs`}
                      placeholder="New chain name..."
                      value={newChainName}
                      onChange={e => setNewChainName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newChainName.trim()) { e.preventDefault(); createChainMutation.mutate(newChainName.trim()); } }}
                    />
                    <button
                      type="button"
                      disabled={!newChainName.trim() || createChainMutation.isPending}
                      onClick={() => createChainMutation.mutate(newChainName.trim())}
                      className="text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-40 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.categories.map(cat => {
                      const c = getCategoryColor(cat.slug);
                      return (
                        <span key={cat.id} className={`${c.bg} ${c.text} text-xs font-bold px-2.5 py-1 rounded`}>{cat.name}</span>
                      );
                    })}
                    {listing.categories.length === 0 && <span className="text-xs text-slate-600">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                      <span key={tag.id} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded">{tag.name}</span>
                    ))}
                    {listing.tags.length === 0 && <span className="text-xs text-slate-600">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Chains</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.chains.map(chain => (
                      <span
                        key={chain.id}
                        className={`text-xs font-bold px-2.5 py-1 rounded ${chain.is_featured ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-300'}`}
                      >
                        {chain.name}
                      </span>
                    ))}
                    {listing.chains.length === 0 && <span className="text-xs text-slate-600">None</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Contact Email</span>
                {editing ? (
                  <input className={`${inputClass} mt-1`} type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} />
                ) : (
                  <a href={`mailto:${listing.contact_email}`} className="block text-primary hover:underline mt-0.5">{listing.contact_email}</a>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Views</span>
                <span className="font-medium">{listing.view_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reputation</span>
                <span className="font-medium">{listing.reputation_score ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted</span>
                <span>{new Date(listing.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated</span>
                <span>{new Date(listing.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {listing.approved_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved</span>
                  <span className="text-emerald-400">{new Date(listing.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {listing.rejection_note && (
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Rejection Note</p>
                  <p className="text-sm text-red-400">{listing.rejection_note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`/listings/${listing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                View Public Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
