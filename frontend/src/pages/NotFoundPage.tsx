import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-slate-400 text-lg mb-8">Page not found</p>
      <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
        Go Home
      </Link>
    </div>
  );
}
