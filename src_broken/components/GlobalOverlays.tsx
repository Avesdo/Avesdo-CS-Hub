import React from 'react';
import AddClientModal from './modals/AddClientModal';
import AddProjectModal from './modals/AddProjectModal';
import AddServiceModal from './modals/AddServiceModal';
import ClientDrawer from './drawers/ClientDrawer';
import ProjectDrawer from './drawers/ProjectDrawer';
import ServiceDrawer from './drawers/ServiceDrawer';
import DashDrilldownDrawer from './drawers/DashDrilldownDrawer';
import UnscheduledProjectsDrawer from './drawers/UnscheduledProjectsDrawer';

export default function GlobalOverlays() {
  return (
    <>
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
    </>
  );
}
