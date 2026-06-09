import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppStateProvider } from './context/AppStateContext'
import { UIProvider } from './context/UIContext'

// Components
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import GlobalOverlays from './components/GlobalOverlays'

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ClientHealth = React.lazy(() => import('./pages/ClientHealth'));
const ProjectTracker = React.lazy(() => import('./pages/ProjectTracker'));
const ServiceHub = React.lazy(() => import('./pages/ServiceHub'));
const Settings = React.lazy(() => import('./pages/Settings'));
const AdminHub = React.lazy(() => import('./pages/AdminHub'));
import { GlobalToaster } from './components/GlobalToaster';

export default function App() {
  return (
    <AppStateProvider>
      <UIProvider>
        <BrowserRouter>
          <GlobalToaster />
          <GlobalOverlays />
        <div data-slot="sidebar-wrapper" className="group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar" style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '3rem' } as React.CSSProperties}>
          <div className="flex h-screen w-full bg-white">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
              <Header />
              <div className="flex-grow flex-1 overflow-hidden relative flex flex-col w-full h-[calc(100vh-var(--header-height))]">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<ClientHealth />} />
                    <Route path="/projects" element={<ProjectTracker />} />
                    <Route path="/services" element={<ServiceHub />} />
                    <Route path="/admin" element={<AdminHub />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </React.Suspense>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
      </UIProvider>
    </AppStateProvider>
  )
}
