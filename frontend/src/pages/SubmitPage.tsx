import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCategories, fetchChains, submitListing } from '../lib/api';
import type { NewListingPayload } from '../types/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const filledStyle = { fontVariationSettings: "'FILL' 1" };

export default function SubmitPage() {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: chains } = useQuery({ queryKey: ['chains'], queryFn: fetchChains });

  // Form state
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [apiEndpointUrl, setApiEndpointUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedChains, setSuggestedChains] = useState<string[]>([]);
  const [chainSuggestionInput, setChainSuggestionInput] = useState('');
  const [chainSuggestionError, setChainSuggestionError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [formError, setFormError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const mutation = useMutation({
    mutationFn: submitListing,
    onError: (err: Error) => setFormError(err.message),
  });

  function addTag(raw: string) {
    const tag = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
    setTagInput('');
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function toggleChain(id: string) {
    setSelectedChains(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function addChainSuggestion() {
    const name = chainSuggestionInput.trim();
    setChainSuggestionError('');
    if (!name) return;
    if (name.length > 100) {
      setChainSuggestionError('Chain name must be 100 characters or less.');
      return;
    }
    // Check duplicate against existing chains (case-insensitive)
    const existingMatch = (chains ?? []).find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingMatch) {
      setChainSuggestionError(`"${existingMatch.name}" already exists — select it from the list above instead.`);
      return;
    }
    // Check duplicate against already-suggested chains
    if (suggestedChains.some(s => s.toLowerCase() === name.toLowerCase())) {
      setChainSuggestionError(`"${name}" has already been added to your suggestions.`);
      return;
    }
    setSuggestedChains(prev => [...prev, name]);
    setChainSuggestionInput('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (selectedCategories.length === 0) {
      setFormError('Please select at least one category.');
      return;
    }

    const payload: NewListingPayload = {
      name,
      short_description: shortDesc,
      description,
      website_url: websiteUrl,
      contact_email: contactEmail,
      categories: selectedCategories,
      tags,
      chains: selectedChains,
    };
    if (logoUrl) payload.logo_url = logoUrl;
    if (githubUrl) payload.github_url = githubUrl;
    if (docsUrl) payload.docs_url = docsUrl;
    if (apiEndpointUrl) payload.api_endpoint_url = apiEndpointUrl;
    if (suggestedChains.length > 0) payload.suggested_chains = suggestedChains;

    mutation.mutate(payload);
  }

  // Success state
  if (mutation.isSuccess) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 text-center">
        <div className="bg-dark-surface p-12 rounded-2xl border border-primary/20 shadow-xl">
          <span className="material-symbols-outlined text-6xl text-emerald-500 mb-6" style={filledStyle}>check_circle</span>
          <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
          <p className="text-slate-400 mb-2">
            Your listing <span className="text-primary font-bold">{name}</span> has been submitted for review.
          </p>
          <p className="text-slate-500 text-sm mb-4">Our team will review it shortly. You'll see it in the directory once approved.</p>
          {mutation.data?.slug && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 mb-8 text-left">
              <p className="text-xs text-slate-400 mb-1">Your listing reference:</p>
              <p className="text-sm font-mono text-primary font-bold">{mutation.data.slug}</p>
              <p className="text-xs text-slate-500 mt-1">Keep this safe — you can use it to check on your listing status.</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
              Browse Directory
            </Link>
            <button
              onClick={() => { mutation.reset(); setName(''); setShortDesc(''); setDescription(''); setWebsiteUrl(''); setLogoUrl(''); setGithubUrl(''); setDocsUrl(''); setApiEndpointUrl(''); setContactEmail(''); setSelectedCategories([]); setSelectedChains([]); setTags([]); setSuggestedChains([]); }}
              className="bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-20 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Column */}
        <div className="flex-1">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Listing Submission Form</h1>
            <p className="text-slate-400 max-w-2xl">Provide essential details to list your tool in the directory. Fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Section 1: Contact Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h2 className="text-xl font-bold">1. Contact Information</h2>
            </div>
            <div className="bg-dark-surface p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-300">
                  Contact Email<span className="text-primary ml-1">*</span>
                  <span className="text-slate-500 font-normal ml-2 text-[10px]">(Internal only — not displayed publicly)</span>
                </label>
                <input
                  className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                  placeholder="dev@example.com"
                  required
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Listing Identity */}
            <div className="flex items-center gap-4 mb-8 pt-12">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h2 className="text-xl font-bold">2. Listing Details</h2>
            </div>
            <div className="bg-dark-surface p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Listing Name<span className="text-primary ml-1">*</span></label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="e.g., Nova Sentry"
                    required
                    type="text"
                    maxLength={100}
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Website URL<span className="text-primary ml-1">*</span></label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="https://myproject.ai"
                    required
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Short Description<span className="text-primary ml-1">*</span>
                    <span className="text-slate-500 font-normal ml-2 text-[10px]">({shortDesc.length}/140)</span>
                  </label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="One-liner for card previews (max 140 chars)"
                    required
                    type="text"
                    maxLength={140}
                    value={shortDesc}
                    onChange={e => setShortDesc(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-300">
                      Full Description<span className="text-primary ml-1">*</span>
                      <span className="text-slate-500 font-normal ml-2 text-[10px]">Markdown supported</span>
                    </label>
                    {description && (
                      <button
                        type="button"
                        onClick={() => setShowPreview(p => !p)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">{showPreview ? 'edit' : 'visibility'}</span>
                        {showPreview ? 'Edit' : 'Preview'}
                      </button>
                    )}
                  </div>
                  {showPreview ? (
                    <div className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 min-h-[120px]">
                      <MarkdownRenderer content={description} />
                    </div>
                  ) : (
                    <textarea
                      className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border min-h-[120px]"
                      placeholder="Detailed description of your tool or service. Supports **bold**, *italic*, ## headings, - lists, and more."
                      required
                      minLength={10}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  )}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Logo URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg border rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 ${logoError ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="https://example.com/logo.png"
                    type="url"
                    value={logoUrl}
                    onChange={e => {
                      const url = e.target.value;
                      setLogoUrl(url);
                      setLogoError('');
                      if (url && !url.match(/\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i) && !url.match(/^https?:\/\/.+/)) {
                        setLogoError('URL must point to a PNG, JPG, SVG, or WebP image.');
                      }
                    }}
                    onBlur={() => {
                      if (logoUrl && !logoUrl.match(/\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i)) {
                        setLogoError('URL should end in .png, .jpg, .svg, or .webp for best results.');
                      }
                    }}
                  />
                  {logoError && (
                    <p className="text-amber-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      {logoError}
                    </p>
                  )}
                  <p className="text-slate-500 text-[10px] mt-1.5 leading-relaxed">
                    Square icon recommended (min 128x128px). Accepted formats: PNG, JPG, SVG, WebP. Max 500KB.
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    GitHub URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="https://github.com/your-org/repo"
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Docs URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="https://docs.myproject.ai"
                    type="url"
                    value={docsUrl}
                    onChange={e => setDocsUrl(e.target.value)}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    API Endpoint <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className="w-full bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="https://api.myproject.ai"
                    type="url"
                    value={apiEndpointUrl}
                    onChange={e => setApiEndpointUrl(e.target.value)}
                  />
                </div>

                {/* Category selection */}
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Category<span className="text-primary ml-1">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(categories ?? []).map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`border p-3 rounded-xl text-sm font-medium text-left transition-all ${
                          selectedCategories.includes(cat.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 text-slate-400 hover:border-primary'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags input */}
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Tags <span className="text-slate-400 font-normal ml-1 text-xs">(Optional — press Enter to add)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-dark-bg border border-white/10 rounded-xl min-h-[48px] items-center">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        {tag}
                        <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      placeholder={tags.length === 0 ? 'e.g., defi, automation, analytics' : ''}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput) addTag(tagInput); }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Blockchain Ecosystem */}
            <div className="flex items-center gap-4 mb-8 pt-12">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h2 className="text-xl font-bold">3. Chain Integration <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span></h2>
            </div>
            <div className="bg-dark-surface p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <label className="block text-sm font-bold mb-2 text-slate-300">Select supported chains</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(chains ?? []).map(chain => {
                  const isSelected = selectedChains.includes(chain.id);
                  return (
                    <div
                      key={chain.id}
                      onClick={() => toggleChain(chain.id)}
                      className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all relative overflow-hidden ${
                        chain.is_featured && isSelected
                          ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/50'
                          : isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-white/10 bg-white/5 hover:border-primary'
                      }`}
                    >
                      {chain.is_featured && (
                        <div className="absolute top-3 right-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined !text-[10px]" style={filledStyle}>stars</span>
                          Featured
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        chain.is_featured ? 'bg-amber-500/20' : 'bg-slate-800'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          chain.is_featured ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {chain.is_featured ? 'toll' : 'link'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{chain.name}</div>
                        {chain.is_featured && (
                          <div className="text-[9px] text-amber-500 font-bold uppercase tracking-tight">Cost-Efficient</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggest Other Chain */}
              <div className="pt-6 border-t border-white/10">
                <label className="block text-sm font-bold mb-2 text-slate-300">
                  Don't see your chain? Suggest one
                  <span className="text-slate-500 font-normal ml-2 text-[10px]">(will be reviewed by admin)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 bg-dark-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border"
                    placeholder="e.g., Solana, Polkadot, Avalanche..."
                    value={chainSuggestionInput}
                    onChange={e => { setChainSuggestionInput(e.target.value); setChainSuggestionError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChainSuggestion(); } }}
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={addChainSuggestion}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
                {chainSuggestionError && (
                  <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    {chainSuggestionError}
                  </p>
                )}
                {suggestedChains.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {suggestedChains.map(sc => (
                      <span key={sc} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium">
                        {sc}
                        <button type="button" onClick={() => setSuggestedChains(prev => prev.filter(s => s !== sc))} className="hover:text-red-400 transition-colors ml-1">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {(formError || mutation.error) && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {formError || (mutation.error as Error).message}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-12 flex flex-col items-center gap-4">
              <button
                className="w-full bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Listing for Verification'}
              </button>
              <p className="text-xs text-slate-500 text-center">Ready to go? Submit your listing to appear in the directory.</p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="sticky top-32 space-y-6">
            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Submission Benefits</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-accent">trending_up</span>
                  <div>
                    <div className="font-bold text-sm">Global Traffic</div>
                    <p className="text-xs text-white/70">Exposure to active traders and builders worldwide.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-accent">verified</span>
                  <div>
                    <div className="font-bold text-sm">Verified Badge</div>
                    <p className="text-xs text-white/70">Boost trust and ranking in the directory.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Onboarding Checklist Card */}
            <div className="bg-dark-surface border border-white/10 p-6 rounded-2xl">
              <h4 className="font-bold text-sm mb-4">Onboarding Checklist</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className={`material-symbols-outlined text-sm ${contactEmail ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {contactEmail ? 'check_circle' : 'circle'}
                  </span>
                  Contact Email (Required)
                </li>
                <li className="flex items-start gap-2">
                  <span className={`material-symbols-outlined text-sm ${name && shortDesc && description && websiteUrl ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {name && shortDesc && description && websiteUrl ? 'check_circle' : 'circle'}
                  </span>
                  Listing Details (Required)
                </li>
                <li className="flex items-start gap-2">
                  <span className={`material-symbols-outlined text-sm ${selectedCategories.length > 0 ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {selectedCategories.length > 0 ? 'check_circle' : 'circle'}
                  </span>
                  Category Selection (Required)
                </li>
                <li className="flex items-start gap-2">
                  <span className={`material-symbols-outlined text-sm ${selectedChains.length > 0 ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {selectedChains.length > 0 ? 'check_circle' : 'circle'}
                  </span>
                  Chain Integration (Optional)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
