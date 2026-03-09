import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchCategories, fetchChains, submitListing } from '../lib/api';
import { APP_NAME } from '../lib/constants';
import type { NewListingPayload } from '../types/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const filledStyle = { fontVariationSettings: "'FILL' 1" };

type FieldErrors = Record<string, string>;

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
      <span className="material-symbols-outlined text-xs">error</span>
      {error}
    </p>
  );
}

function inputBorder(error?: string) {
  return error ? 'border-red-500/50' : 'border-white/10';
}

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
  const [logoWarning, setLogoWarning] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<NewListingPayload | null>(null);

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
    setFieldErrors(prev => { const { categories: _, ...rest } = prev; return rest; });
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
    const existingMatch = (chains ?? []).find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingMatch) {
      setChainSuggestionError(`"${existingMatch.name}" already exists — select it from the list above instead.`);
      return;
    }
    if (suggestedChains.some(s => s.toLowerCase() === name.toLowerCase())) {
      setChainSuggestionError(`"${name}" has already been added to your suggestions.`);
      return;
    }
    setSuggestedChains(prev => [...prev, name]);
    setChainSuggestionInput('');
  }

  function isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return (u.protocol === 'https:' || u.protocol === 'http:') && /\.[a-zA-Z]{2,}$/.test(u.hostname);
    } catch {
      return false;
    }
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!contactEmail.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contactEmail)) {
      errors.email = 'Enter a valid email (e.g. you@example.com).';
    }

    if (!name.trim()) errors.name = 'Listing name is required.';

    if (!websiteUrl.trim()) {
      errors.website = 'Website URL is required.';
    } else if (!websiteUrl.startsWith('https://')) {
      errors.website = 'Must start with https://';
    } else if (!isValidUrl(websiteUrl)) {
      errors.website = 'Enter a valid URL (e.g. https://example.com).';
    }

    if (!shortDesc.trim()) errors.shortDesc = 'Short description is required.';

    if (description.trim().length < 10) {
      errors.description = 'Must be at least 10 characters.';
    }

    if (logoUrl && !isValidUrl(logoUrl)) {
      errors.logo = 'Enter a valid URL (e.g. https://example.com/logo.png).';
    }

    if (githubUrl) {
      if (!githubUrl.startsWith('https://github.com/')) {
        errors.github = 'Must start with https://github.com/';
      } else if (!isValidUrl(githubUrl)) {
        errors.github = 'Enter a valid GitHub URL.';
      }
    }

    if (docsUrl && !isValidUrl(docsUrl)) {
      errors.docs = 'Enter a valid URL (e.g. https://docs.example.com).';
    }

    if (apiEndpointUrl && !isValidUrl(apiEndpointUrl)) {
      errors.api = 'Enter a valid URL (e.g. https://api.example.com).';
    }

    if (selectedCategories.length === 0) {
      errors.categories = 'Select at least one category.';
    }

    return errors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-field="${firstErrorKey}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    setPendingPayload(payload);
    setShowConfirmation(true);
  }

  function confirmSubmit() {
    if (pendingPayload) {
      mutation.mutate(pendingPayload);
      setShowConfirmation(false);
      setPendingPayload(null);
    }
  }

  // Clear field error on change
  function clearError(field: string) {
    setFieldErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
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
              <p className="text-xs text-slate-500 mt-1">Keep this safe — you can use it to <Link to="/check-status" className="text-primary hover:underline">check your submission status</Link>.</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/check-status" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
              Check Submission Status
            </Link>
            <Link to="/browse" className="bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors">
              Browse Directory
            </Link>
            <button
              onClick={() => { mutation.reset(); setName(''); setShortDesc(''); setDescription(''); setWebsiteUrl(''); setLogoUrl(''); setGithubUrl(''); setDocsUrl(''); setApiEndpointUrl(''); setContactEmail(''); setSelectedCategories([]); setSelectedChains([]); setTags([]); setSuggestedChains([]); setFieldErrors({}); }}
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
    <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-20 py-12">
      <Helmet>
        <title>Submit a Listing</title>
        <meta name="description" content="Submit your AI agent, tool, or infrastructure to the AgentRadar directory." />
        <meta property="og:title" content={`Submit a Listing | ${APP_NAME}`} />
        <meta property="og:description" content="Submit your AI agent, tool, or infrastructure to the AgentRadar directory." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Column */}
        <div className="flex-1">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Listing Submission Form</h1>
            <p className="text-slate-400 max-w-2xl">Provide essential details to list your tool in the directory. Fields marked with * are required.</p>
            <div className="mt-4 px-4 py-3 bg-accent/5 border border-accent/20 rounded-lg inline-flex items-center gap-2 text-sm text-accent">
              <span className="material-symbols-outlined text-lg">api</span>
              <span>Submitting via API? Use <code className="font-mono bg-accent/10 px-1.5 py-0.5 rounded text-xs">POST /api/listings</code> -- no UI required. <Link to="/api-docs" className="underline font-bold hover:text-white transition-colors">View docs</Link></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0" noValidate>
            {/* Section 1: Contact Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h2 className="text-xl font-bold">1. Contact Information</h2>
            </div>
            <div className="bg-dark-surface p-4 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <div data-field="email">
                <label className="block text-sm font-bold mb-2 text-slate-300">
                  Contact Email<span className="text-primary ml-1">*</span>
                  <span className="text-slate-500 font-normal ml-2 text-[10px]">(Internal only — not displayed publicly)</span>
                </label>
                <input
                  className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.email)}`}
                  placeholder="dev@example.com"
                  type="text"
                  value={contactEmail}
                  onChange={e => { setContactEmail(e.target.value); clearError('email'); }}
                />
                <FieldError error={fieldErrors.email} />
              </div>
            </div>

            {/* Section 2: Listing Identity */}
            <div className="flex items-center gap-4 mb-8 pt-12">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h2 className="text-xl font-bold">2. Listing Details</h2>
            </div>
            <div className="bg-dark-surface p-4 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1" data-field="name">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Listing Name<span className="text-primary ml-1">*</span></label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.name)}`}
                    placeholder="e.g., Nova Sentry"
                    type="text"
                    maxLength={100}
                    value={name}
                    onChange={e => { setName(e.target.value); clearError('name'); }}
                  />
                  <FieldError error={fieldErrors.name} />
                </div>
                <div className="col-span-2 md:col-span-1" data-field="website">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Website URL<span className="text-primary ml-1">*</span></label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.website)}`}
                    placeholder="https://myproject.ai"
                    type="text"
                    value={websiteUrl}
                    onChange={e => { setWebsiteUrl(e.target.value); clearError('website'); }}
                    onBlur={e => {
                      const v = e.target.value.trim();
                      if (v && !v.startsWith('http://') && !v.startsWith('https://')) {
                        setWebsiteUrl('https://' + v);
                      }
                    }}
                  />
                  <FieldError error={fieldErrors.website} />
                </div>
                <div className="col-span-2" data-field="shortDesc">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Short Description<span className="text-primary ml-1">*</span>
                    <span className="text-slate-500 font-normal ml-2 text-[10px]">({shortDesc.length}/140)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.shortDesc)}`}
                    placeholder="One-liner for card previews (max 140 chars)"
                    type="text"
                    maxLength={140}
                    value={shortDesc}
                    onChange={e => { setShortDesc(e.target.value); clearError('shortDesc'); }}
                  />
                  <FieldError error={fieldErrors.shortDesc} />
                </div>
                <div className="col-span-2" data-field="description">
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
                      className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border min-h-[120px] ${inputBorder(fieldErrors.description)}`}
                      placeholder="Detailed description of your tool or service. Supports **bold**, *italic*, ## headings, - lists, and more."
                      minLength={10}
                      value={description}
                      onChange={e => { setDescription(e.target.value); clearError('description'); }}
                    />
                  )}
                  <FieldError error={fieldErrors.description} />
                </div>
                <div className="col-span-2 md:col-span-1" data-field="logo">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Logo URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg border rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 ${fieldErrors.logo ? 'border-red-500/50' : logoWarning ? 'border-amber-500/50' : 'border-white/10'}`}
                    placeholder="https://example.com/logo.png"
                    type="text"
                    value={logoUrl}
                    onChange={e => {
                      const url = e.target.value;
                      setLogoUrl(url);
                      setLogoWarning('');
                      clearError('logo');
                      if (url && !url.match(/\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i) && !url.match(/^https?:\/\/.+/)) {
                        setLogoWarning('URL must point to a PNG, JPG, SVG, or WebP image.');
                      }
                    }}
                    onBlur={() => {
                      if (logoUrl && !logoUrl.match(/\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i)) {
                        setLogoWarning('URL should end in .png, .jpg, .svg, or .webp for best results.');
                      }
                    }}
                  />
                  <FieldError error={fieldErrors.logo} />
                  {!fieldErrors.logo && logoWarning && (
                    <p className="text-amber-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      {logoWarning}
                    </p>
                  )}
                  <p className="text-slate-500 text-[10px] mt-1.5 leading-relaxed">
                    Square icon recommended (min 128x128px). Accepted formats: PNG, JPG, SVG, WebP. Max 500KB.
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1" data-field="github">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    GitHub URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.github)}`}
                    placeholder="https://github.com/your-org/repo"
                    type="text"
                    value={githubUrl}
                    onChange={e => { setGithubUrl(e.target.value); clearError('github'); }}
                  />
                  <FieldError error={fieldErrors.github} />
                </div>
                <div className="col-span-2 md:col-span-1" data-field="docs">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    Docs URL <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.docs)}`}
                    placeholder="https://docs.myproject.ai"
                    type="text"
                    value={docsUrl}
                    onChange={e => { setDocsUrl(e.target.value); clearError('docs'); }}
                  />
                  <FieldError error={fieldErrors.docs} />
                </div>
                <div className="col-span-2 md:col-span-1" data-field="api">
                  <label className="block text-sm font-bold mb-2 text-slate-300">
                    API Endpoint <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                  </label>
                  <input
                    className={`w-full bg-dark-bg rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-sm text-slate-100 placeholder-slate-500 border ${inputBorder(fieldErrors.api)}`}
                    placeholder="https://api.myproject.ai"
                    type="text"
                    value={apiEndpointUrl}
                    onChange={e => { setApiEndpointUrl(e.target.value); clearError('api'); }}
                  />
                  <FieldError error={fieldErrors.api} />
                </div>

                {/* Category selection */}
                <div className="col-span-2" data-field="categories">
                  <label className="block text-sm font-bold mb-2 text-slate-300">Category<span className="text-primary ml-1">*</span></label>
                  <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${fieldErrors.categories ? 'ring-1 ring-red-500/30 rounded-xl p-2 -m-2' : ''}`}>
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
                  <FieldError error={fieldErrors.categories} />
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
            <div className="bg-dark-surface p-4 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
              <label className="block text-sm font-bold mb-2 text-slate-300">Select supported chains</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(chains ?? []).map(chain => {
                  const isSelected = selectedChains.includes(chain.id);
                  return (
                    <div
                      key={chain.id}
                      onClick={() => toggleChain(chain.id)}
                      className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all relative overflow-hidden ${
                        isSelected
                          ? chain.is_featured
                            ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/50'
                            : 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-white/10 bg-white/5 hover:border-primary'
                      }`}
                    >
                      {chain.is_featured && (
                        <div className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                          isSelected
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                        }`}>
                          <span className="material-symbols-outlined !text-[10px]" style={filledStyle}>stars</span>
                          Featured
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        chain.is_featured && isSelected ? 'bg-amber-500/20' : 'bg-slate-800'
                      }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                          chain.is_featured && isSelected ? 'text-amber-500' : isSelected ? 'text-primary' : 'text-slate-400'
                        }`}>
                          {chain.is_featured ? 'toll' : 'link'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{chain.name}</div>
                        {chain.is_featured && isSelected && (
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

            {/* Server error */}
            {(formError || mutation.error) && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {formError || (mutation.error instanceof Error ? mutation.error.message : 'Submission failed. Please try again.')}
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

      {/* Confirmation Modal */}
      {showConfirmation && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-surface border border-primary/20 rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-amber-500" style={filledStyle}>warning</span>
              <h3 className="text-xl font-bold">Review Before Submitting</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Submissions cannot be edited after submission. Please review your details carefully.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-slate-500 w-24 shrink-0">Name</span>
                <span className="font-medium">{pendingPayload.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-24 shrink-0">Website</span>
                <span className="text-primary break-all">{pendingPayload.website_url}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-24 shrink-0">Summary</span>
                <span className="text-slate-300">{pendingPayload.short_description}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-24 shrink-0">Categories</span>
                <span className="text-slate-300">
                  {pendingPayload.categories.map(id => categories?.find(c => c.id === id)?.name || id).join(', ')}
                </span>
              </div>
              {pendingPayload.tags.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-slate-500 w-24 shrink-0">Tags</span>
                  <span className="text-slate-300">{pendingPayload.tags.join(', ')}</span>
                </div>
              )}
              {pendingPayload.docs_url && (
                <div className="flex gap-2">
                  <span className="text-slate-500 w-24 shrink-0">Docs URL</span>
                  <span className="text-primary break-all">{pendingPayload.docs_url}</span>
                </div>
              )}
              {pendingPayload.github_url && (
                <div className="flex gap-2">
                  <span className="text-slate-500 w-24 shrink-0">GitHub</span>
                  <span className="text-primary break-all">{pendingPayload.github_url}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setShowConfirmation(false); setPendingPayload(null); }}
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium"
              >
                Go Back & Edit
              </button>
              <button
                onClick={confirmSubmit}
                disabled={mutation.isPending}
                className="flex-1 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {mutation.isPending ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
