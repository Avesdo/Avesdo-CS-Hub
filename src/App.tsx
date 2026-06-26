import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clients" element={<ClientHealth />} />
                      <Route path="/projects" element={<ProjectTracker />} />
                      <Route path="/services" element={<ServiceHub />} />

                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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
            path="/portal/:projectId"
            element={
              <React.Suspense
                fallback={<ClientPortalSkeleton />}
              >
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
