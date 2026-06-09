import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppStateProvider } from './context/AppStateContext'

// Components
import Sidebar from './components/Sidebar'
import Header from './components/Header'

// Pages
import Dashboard from './pages/Dashboard'
import ClientHealth from './pages/ClientHealth'
import ProjectTracker from './pages/ProjectTracker'
import ServiceHub from './pages/ServiceHub'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <div data-slot="sidebar-wrapper" className="group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar" style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '3rem' }}>
          <div className="flex h-screen w-full bg-white">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
              <Header />
              <div className="flex-grow flex-1 overflow-hidden relative flex flex-col w-full h-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/health" element={<ClientHealth />} />
                  <Route path="/tracker" element={<ProjectTracker />} />
                  <Route path="/services" element={<ServiceHub />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  )
}