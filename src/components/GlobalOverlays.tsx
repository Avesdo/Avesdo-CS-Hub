import React, { Suspense, useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';

const AddClientModal = React.lazy(() => import('./modals/AddClientModal'));
const AddProjectModal = React.lazy(() => import('./modals/AddProjectModal'));
const AddServiceModal = React.lazy(() => import('./modals/AddServiceModal'));
const ClientDrawer = React.lazy(() => import('./drawers/ClientDrawer'));
const ProjectDrawer = React.lazy(() => import('./drawers/ProjectDrawer'));
const ServiceDrawer = React.lazy(() => import('./drawers/ServiceDrawer'));
const DashDrilldownDrawer = React.lazy(() => import('./drawers/DashDrilldownDrawer'));
const UnscheduledProjectsDrawer = React.lazy(() => import('./drawers/UnscheduledProjectsDrawer'));

export default function GlobalOverlays() {
  const { isModalOpen, isDrawerOpen } = useUI();

  // For Modals, we want to keep them mounted after first open so Radix UI can play exit animations.
  // They will NOT be fetched until they are opened for the first time.
  const [mountedModals, setMountedModals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isModalOpen('addClient')) setMountedModals(p => ({ ...p, addClient: true }));
    if (isModalOpen('addProject')) setMountedModals(p => ({ ...p, addProject: true }));
    if (isModalOpen('addService')) setMountedModals(p => ({ ...p, addService: true }));
  }, [isModalOpen]);

  return (
    <Suspense fallback={null}>
      {/* Modals - Rendered once requested, then kept mounted for Radix animations */}
      {mountedModals.addClient && <AddClientModal />}
      {mountedModals.addProject && <AddProjectModal />}
      {mountedModals.addService && <AddServiceModal />}
      
      {/* Drawers - Safe to conditionally mount because UIContext keeps them 'open' for 300ms while closing */}
      {isDrawerOpen('client') && <ClientDrawer />}
      {isDrawerOpen('project') && <ProjectDrawer />}
      {isDrawerOpen('service') && <ServiceDrawer />}
      {isDrawerOpen('dashDrilldown') && <DashDrilldownDrawer />}
      {isDrawerOpen('unscheduledProjects') && <UnscheduledProjectsDrawer />}
    </Suspense>
  );
}
