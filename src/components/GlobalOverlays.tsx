import React, { Suspense, useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

const AddClientModal = React.lazy(() => import('./modals/AddClientModal'));
const AddProjectModal = React.lazy(() => import('./modals/AddProjectModal'));
const AddServiceModal = React.lazy(() => import('./modals/AddServiceModal'));
const ScheduleModal = React.lazy(() => import('./modals/ScheduleModal'));
const DashDrilldownDrawer = React.lazy(() => import('./drawers/DashDrilldownDrawer'));
const UnscheduledProjectsDrawer = React.lazy(() => import('./drawers/UnscheduledProjectsDrawer'));

export default function GlobalOverlays() {
  const { isModalOpen, isDrawerOpen, activeModals, activeDrawers } = useUIStore();

  // For Modals, we want to keep them mounted after first open so Radix UI can play exit animations.
  // They will NOT be fetched until they are opened for the first time.
  const [mountedModals, setMountedModals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isModalOpen('addClient')) setMountedModals((p) => ({ ...p, addClient: true }));
    if (isModalOpen('addProject')) setMountedModals((p) => ({ ...p, addProject: true }));
    if (isModalOpen('addService')) setMountedModals((p) => ({ ...p, addService: true }));
    if (isModalOpen('scheduleModal')) setMountedModals((p) => ({ ...p, scheduleModal: true }));
  }, [activeModals]);

  return (
    <Suspense fallback={null}>
      {/* Modals - Rendered once requested, then kept mounted for Radix animations */}
      {mountedModals.addClient && <AddClientModal />}
      {mountedModals.addProject && <AddProjectModal />}
      {mountedModals.addService && <AddServiceModal />}
      {mountedModals.scheduleModal && <ScheduleModal />}

      {/* Drawers - Safe to conditionally mount because UIContext keeps them 'open' for 300ms while closing */}
      {isDrawerOpen('dashDrilldown') && <DashDrilldownDrawer />}
      {isDrawerOpen('unscheduledProjects') && <UnscheduledProjectsDrawer />}
    </Suspense>
  );
}
