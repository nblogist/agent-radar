import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../../lib/constants';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-bg/80 border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 font-bold text-lg text-white hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">deployed_code</span>
            {APP_NAME}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/browse"
              className={({ isActive }) =>
                isActive ? 'text-primary' : 'text-gray-300 hover:text-white transition-colors'
              }
            >
              Directory
            </NavLink>
            <span
              className="text-gray-500 cursor-not-allowed select-none"
              title="Coming Soon"
            >
              Rankings
            </span>
            <NavLink
              to="/submit"
              className={({ isActive }) =>
                isActive ? 'text-primary' : 'text-gray-300 hover:text-white transition-colors'
              }
            >
              Submit
            </NavLink>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" aria-hidden="true">search</span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-dark-surface border border-dark-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </form>

          {/* Submit CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/submit"
              className="hidden md:inline-flex items-center bg-primary hover:scale-[1.05] active:scale-95 transition-all rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              Submit Agent
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen(o => !o)}
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-surface px-4 py-4 flex flex-col gap-4">
          <NavLink
            to="/browse"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? 'text-primary font-semibold' : 'text-gray-300 hover:text-white transition-colors'
            }
          >
            Directory
          </NavLink>
          <span className="text-gray-500 cursor-not-allowed select-none" title="Coming Soon">Rankings</span>
          <NavLink
            to="/submit"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? 'text-primary font-semibold' : 'text-gray-300 hover:text-white transition-colors'
            }
          >
            Submit
          </NavLink>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" aria-hidden="true">search</span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-dark-bg border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button type="submit" className="bg-primary rounded-lg px-3 py-2 text-sm font-semibold hover:scale-[1.05] active:scale-95 transition-all">Go</button>
          </form>
        </div>
      )}
    </header>
  );
}
