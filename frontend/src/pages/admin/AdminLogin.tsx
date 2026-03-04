import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../lib/adminStore';
import { api, ApiError } from '../../lib/api';
import { APP_NAME } from '../../lib/constants';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setStoreToken = useAdminStore((s) => s.setToken);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.admin.stats(token.trim());
      setStoreToken(token.trim());
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid token');
      } else {
        setError('Could not reach the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">deployed_code</span>
          <h1 className="text-2xl font-bold mt-3">{APP_NAME} Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your admin token to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Admin token"
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
