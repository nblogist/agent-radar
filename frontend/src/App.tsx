import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { APP_NAME } from './lib/constants';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ListingDetailPage from './pages/ListingDetailPage';
import SubmitPage from './pages/SubmitPage';
import CheckStatusPage from './pages/CheckStatusPage';
import NotFoundPage from './pages/NotFoundPage';
import ApiDocsPage from './pages/ApiDocsPage';
// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEditListing from './pages/admin/AdminEditListing';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <Helmet defaultTitle={`${APP_NAME} | AI Agent Directory`} titleTemplate={`%s | ${APP_NAME}`} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Admin login (unauthenticated, no layout) */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Protected admin routes: AdminGuard checks token, AdminLayout provides sidebar */}
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/listings" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/listings/:id" element={<AdminEditListing />} />
              </Route>
            </Route>

            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/listings/:slug" element={<ListingDetailPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/check-status" element={<CheckStatusPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
