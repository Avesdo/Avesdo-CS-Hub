import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useAppStore } from './store/useAppStore';
import { UIProvider } from './context/UIContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ServiceProfileModal from './components/modals/ServiceProfileModal';
import ClientProfileModal from './components/modals/ClientProfileModal';
import ProjectProfileModal from './components/modals/ProjectProfileModal';
import GlobalOverlays from './components/GlobalOverlays';
import { AppLoadingSkeleton, ClientPortalSkeleton } from './components/ui/Skeleton';
import { GlobalToaster } from './components/GlobalToaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ClientHealth = React.lazy(() => import('./pages/ClientHealth'));
const ProjectTracker = React.lazy(() => import('./pages/ProjectTracker'));
const ServiceHub = React.lazy(() => import('./pages/ServiceHub'));
const Settings = React.lazy(() => import('./pages/Settings'));
const SupportDashboard = React.lazy(() => import('./pages/SupportDashboard'));

const Login = React.lazy(() => import('./pages/Login'));
const ClientPortal = React.lazy(() => import('./pages/ClientPortal'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-white">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SyncWrapper({ children }: { children: React.ReactNode }) {
  useFirebaseSync();
  const ready = useAppStore((state) => state.ready);
  const settings = useAppStore((state) => state.settings);

  React.useEffect(() => {
    // Frontend Cron: Check if snapshot needs to run today
    if (ready.settings && ready.clients && ready.projects && settings) {
      const todayStr = new Date().toDateString();
      if (settings.lastSnapshotDate !== todayStr) {
        // Trigger background snapshot generation
        import('./api/snapshotService').then(({ generateDailyHealthSnapshots }) => {
          generateDailyHealthSnapshots().catch(console.error);
        });
      }
    }
  }, [ready, settings]);

  if (!ready.settings || !ready.clients || !ready.projects || !ready.services || !ready.aliases) {
    return <AppLoadingSkeleton />;
  }

  return <>{children}</>;
}

function MainLayout() {
  return (
    <SyncWrapper>
      <UIProvider>
        <ErrorBoundary>
          <ProjectProfileModal />
          <ServiceProfileModal />
          <ClientProfileModal />
          <GlobalOverlays />
        </ErrorBoundary>
        <GlobalToaster />
        <div
          data-slot="sidebar-wrapper"
          className="group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar"
          style={
            { '--sidebar-width': '16rem', '--sidebar-width-icon': '3rem' } as React.CSSProperties
          }
        >
          <div className="flex h-screen w-full bg-white">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
              <Header />
              <div className="flex-grow flex-1 overflow-hidden relative flex flex-col w-full h-[calc(100vh-var(--header-height))]">
                <ErrorBoundary>
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <AnimatedRoutes />
                  </React.Suspense>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </UIProvider>
    </SyncWrapper>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />
        <Route
          path="/clients"
          element={
            <PageWrapper>
              <ClientHealth />
            </PageWrapper>
          }
        />
        <Route
          path="/projects"
          element={
            <PageWrapper>
              <ProjectTracker />
            </PageWrapper>
          }
        />
        <Route
          path="/services"
          element={
            <PageWrapper>
              <ServiceHub />
            </PageWrapper>
          }
        />
        <Route
          path="/support"
          element={
            <PageWrapper>
              <SupportDashboard />
            </PageWrapper>
          }
        />
        <Route
          path="/settings"
          element={
            <PageWrapper>
              <Settings />
            </PageWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full flex flex-col"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <GlobalToaster />
          <Routes>
            <Route
              path="/login"
              element={
                <React.Suspense
                  fallback={
                    <div className="flex items-center justify-center w-full h-screen bg-white">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <Login />
                </React.Suspense>
              }
            />
            <Route
              path="/portal/:identifier"
              element={
                <React.Suspense fallback={<ClientPortalSkeleton />}>
                  <ClientPortal />
                </React.Suspense>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
