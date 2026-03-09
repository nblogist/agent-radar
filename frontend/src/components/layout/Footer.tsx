import { Link } from 'react-router-dom';
import { APP_NAME } from '../../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-primary/20 py-12 px-4 sm:px-6 lg:px-20">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl">deployed_code</span>
            <Link to="/" className="text-lg font-bold">{APP_NAME}</Link>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Discover and explore AI agents, tools, and infrastructure across the decentralized web. An open directory for the agentic economy.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://github.com/nblogist/AgentRadar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">code</span>
            </a>
            <a href="https://www.nervos.org/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/browse" className="hover:text-primary transition-colors">Directory</Link></li>
              <li><Link to="/browse?sort=newest" className="hover:text-primary transition-colors">New Listings</Link></li>
              <li><Link to="/check-status" className="hover:text-primary transition-colors">Check Submission Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Developer</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/api-docs" className="hover:text-primary transition-colors">API Docs</Link></li>
              <li><Link to="/submit" className="hover:text-primary transition-colors">Submit a Listing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Initiative</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="https://www.nervos.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Nervos Network</a></li>
              <li><a href="https://github.com/nblogist/AgentRadar" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-12 pt-8 border-t border-primary/10 flex flex-col gap-4 items-center text-center">
        <p className="text-xs text-slate-500">
          Made with love by{' '}
          <a href="https://x.com/furqandotahmed" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
            Furqan (@furqandotahmed)
          </a>{' '}
          in Pakistan — Part of the{' '}
          <a href="https://www.nervos.org/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
            Humans Not Required
          </a>{' '}
          initiative by Nervos/CKB
        </p>
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Network Status: Live
          </span>
        </div>
      </div>
    </footer>
  );
}
