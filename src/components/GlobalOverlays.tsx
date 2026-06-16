import React, { Suspense } from 'react';

const AddClientModal = React.lazy(() => import('./modals/AddClientModal'));
const AddProjectModal = React.lazy(() => import('./modals/AddProjectModal'));
const AddServiceModal = React.lazy(() => import('./modals/AddServiceModal'));
const ClientDrawer = React.lazy(() => import('./drawers/ClientDrawer'));
const ProjectDrawer = React.lazy(() => import('./drawers/ProjectDrawer'));
const ServiceDrawer = React.lazy(() => import('./drawers/ServiceDrawer'));
const DashDrilldownDrawer = React.lazy(() => import('./drawers/DashDrilldownDrawer'));
const UnscheduledProjectsDrawer = React.lazy(() => import('./drawers/UnscheduledProjectsDrawer'));

export default function GlobalOverlays() {
  return (
    <Suspense fallback={null}>
      {/* Modals */}
      <AddClientModal />
      <AddProjectModal />
      <AddServiceModal />
      {/* Drawers */}
      <ClientDrawer />
      <ProjectDrawer />
      <ServiceDrawer />
      <DashDrilldownDrawer />
      <UnscheduledProjectsDrawer />
    </Suspense>
  );
}
