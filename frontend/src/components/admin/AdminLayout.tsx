import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../lib/adminStore';
import { APP_NAME } from '../../lib/constants';

export function AdminLayout() {
  const clearToken = useAdminStore((s) => s.clearToken);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  function handleLogout() {
    clearToken();
    navigate('/admin', { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-dark-bg flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined">radar</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{APP_NAME}</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a href="/submit" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-all text-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            New Listing
          </a>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 py-2 rounded-lg transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-dark-bg">
        <header className="h-16 border-b border-slate-800 bg-dark-bg/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={e => {
              e.preventDefault();
              const q = searchInput.trim();
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (q) { next.set('search', q); } else { next.delete('search'); }
                next.delete('page');
                return next;
              });
            }} className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search submissions, listings, or authors..."
                type="text"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('search'); n.delete('page'); return n; });
                  }
                }}
              />
              {searchInput && (
                <button type="button" onClick={() => {
                  setSearchInput('');
                  setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('search'); n.delete('page'); return n; });
                }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </form>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
