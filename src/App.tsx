import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useSession } from './lib/session';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyPage from './pages/PropertyPage';
import MapPage from './pages/MapPage';
import ServicesPage from './pages/ServicesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import NewApplicationPage from './pages/NewApplicationPage';
import AccountPage from './pages/AccountPage';
import OfficePage from './pages/OfficePage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Three.js is heavy — only load it on the building planner.
const BuildPage = lazy(() => import('./pages/BuildPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="container-x py-24"><div className="skeleton h-[60vh]" /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function RequireAuth({ children, role }: { children: ReactNode; role?: 'officer' }) {
  const { user } = useSession();
  const location = useLocation();
  if (!user || (role && user.role !== role)) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}${role ? `&role=${role}` : ''}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="property/:id" element={<PropertyPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="build" element={<BuildPage />} />
          <Route path="build/:id" element={<BuildPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="applications" element={<RequireAuth><ApplicationsPage /></RequireAuth>} />
          <Route path="applications/new" element={<RequireAuth><NewApplicationPage /></RequireAuth>} />
          <Route path="applications/:id" element={<RequireAuth><ApplicationDetailPage /></RequireAuth>} />
          <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="office" element={<RequireAuth role="officer"><OfficePage /></RequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
