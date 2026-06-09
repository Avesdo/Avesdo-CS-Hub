import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, Info, Pencil, ChevronDown, Check, Trash2, AlertTriangle } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { getSettingBadge } from '../../utils/uiUtils';
import { updateClientRecord, deleteClientRecord, updateProjectRecord, updateServiceRecord } from '../../api/dbService';

import ClientHealthTab from './client/ClientHealthTab';
import ClientTrendsTab from './client/ClientTrendsTab';
import ClientProjectsTab from './client/ClientProjectsTab';
import { AlertTriangle, Info, CreditCard, Box, Users, ChevronDown, Check, X } from 'lucide-react';
import { updateClientRecord, deleteClientRecord } from '../../api/dbService';
import { calculateClientHealth } from '../../utils/scoringUtils';
import ClientHealthTab from './client/ClientHealthTab';
  const { isDrawerOpen, getDrawerData, closeDrawer } = useUI();
  const { clients, projects, services, settings } = useAppState();
  // Focus trap ref
  const focusTrapRef = useRef<HTMLDivElement>(null);
"  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);\n  \n  const popRef = useRef<HTMLDivElement>(null);\n\n  // Auto-hide confirm delete\n  useEffect(() => {\n    if (isConfirmingDelete) {\n      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);\n      return () => clearTimeout(timer);\n    }\n  }, [isConfirmingDelete]);\n\n  useEffect(() => {\n    if (client) {\n      setEditNameValue(client.companyName || client.name || '');\n      setIsConfirmingDelete(false);\n    }\n  }, [client]);\n\n  // Click outside to close popovers\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (popRef.current && !popRef.current.contains(event.target as Node)) {\n        setOpenPop(null);\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, []);\n\n  if (!isOpen || !client) return null;\n\n  const handleSaveName = async () => {\n    setIsEditingName(false);\n    if (!client || editNameValue.trim() === '' || editNameValue === (client.companyName || client.name)) return;\n    try {\n      const oldName = client.companyName || client.name;\n      const newName = editNameValue.trim();\n      await updateClientRecord({ ...client, companyName: newName, name: newName });\n      \n      // Cascade to projects and services\n      const projectsToUpdate = projects.filter(p => p.clients?.includes(oldName));\n      if (projectsToUpdate.length > 0) {\n        // Find projects and replace the name\n        projectsToUpdate.forEach(p => {\n           const updatedClients = p.clients.map(c => c === oldName ? newName : c);\n           updateProjectRecord({ ...p, clients: updatedClients });\n        });\n      }\n      const servicesToUpdate = services.filter(s => s.clients?.includes(oldName));\n      if (servicesToUpdate.length > 0) {\n        servicesToUpdate.forEach(s => {\n           const updatedClients = s.clients.map(c => c === oldName ? newName : c);\n  
<truncated 2496 bytes>
    }
  }, [isConfirmingDelete]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(event.target as Node)) {
        setOpenPop(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOpen = isDrawerOpen('client');
  const drawerData = getDrawerData('client');
  const client = clients.find(c => c.clientId === drawerData?.entityId || c.id === drawerData?.entityId);

  useEffect(() => {
    if (client) {
      setEditNameValue(client.companyName || client.name || '');
      setIsConfirmingDelete(false);
    }
  }, [client]);

  React.useEffect(() => {
    if (isOpen && drawerData?.data?.targetTab) {
      setActiveTab(drawerData.data.targetTab);
    } else if (isOpen && !drawerData?.data?.targetTab) {
      setActiveTab('health');
    }
  }, [isOpen, drawerData?.entityId, drawerData?.data]);

  if (!isOpen || !client) return null;
      // Cascade to projects and services
      const projectsToUpdate = projects.filter((p: any) => p.clients?.includes(oldName));
      if (projectsToUpdate.length > 0) {
        // Find projects and replace the name
        projectsToUpdate.forEach((p: any) => {
           const updatedClients = p.clients.map((c: any) => c === oldName ? newName : c);
           updateProjectRecord({ ...p, clients: updatedClients });
        });
      }
      const servicesToUpdate = services.filter((s: any) => s.clients?.includes(oldName));
      if (servicesToUpdate.length > 0) {
        servicesToUpdate.forEach((s: any) => {
           const updatedClients = s.clients.map((c: any) => c === oldName ? newName : c);
           updateServiceRecord({ ...s, clients: updatedClients });
        });
      }
  const tabs = [
    { id: 'health', label: 'Health' },
    { id: 'trends', label: 'Trends' },
      // Cascade to projects and services
      const projectsToUpdate = projects.filter((p: any) => p.clientIds?.includes(client.clientId || client.id));
      if (projectsToUpdate.length > 0) {
        // Find projects and replace the name
        projectsToUpdate.forEach((p: any) => {
           const updatedClients = p.clients.map((c: any) => c === oldName ? newName : c);
           updateProjectRecord({ ...p, clients: updatedClients });
        });
      }
      const servicesToUpdate = services.filter((s: any) => s.clientIds?.includes(client.clientId || client.id));
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${ activeTab === tab.id ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border' }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
"  const tabs = [\n    { id: 'health', label: 'Health' },\n    { id: 'trends', label: 'Trends' },\n    { id: 'projects', label: 'Projects' },\n    { id: 'services', label: 'Services' },\n    { id: 'notes', label: 'Notes & Logs' }\n  ] as const;\n\n  const healthResult = calculateClientHealth(client, projects, settings);\n  const healthScore = healthResult.totalScore;\n  const hasSuspendedProjects = healthResult.hasSuspended;\n\n  return (\n    <>\n      {/* Overlay */}\n      <div \n        className=\"fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]\" \n        onClick={closeDrawer}\n      ></div>\n      \n      {/* Drawer */}\n      <div \n        className=\"fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-border z-[110] animate-in slide-in-from-right duration-300\"\n      >\n        {hasSuspendedProjects && (\n          <div className=\"bg-red-50 text-red-600 border-b border-red-200 px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0\">\n            <AlertTriangle className=\"w-5 h-5 shrink-0\" />\n            <span>This client has projects that are suspended due to outstanding invoices.</span>\n          </div>\n        )}\n\n        {client?.activeProjectCount === 0 && !hasSuspendedProjects && (\n          <div className=\"bg-muted/50 text-muted-foreground border-b border-border px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0\">\n            <Info className=\"w-5 h-5 shrink-0 text-muted-foreground\" />\n            <span>This client currently has no Active projects. Health metrics are paused until a project goes live.</span>\n          </div>\n        )}\n\n        <div className=\"px-6 py-5 border-b border-border bg-slate-50 flex items-center gap-6 relative shrink-0\">\n          <div className=\"gauge-container shrink-0\">\n            <svg className=\"gauge-svg\" viewBox=\"0 0 100 100\">\n              <circle className=\"gauge-bg\" cx=\"50\" cy=\"50\" r=\"42\" />\n              <circle \n                className={`gauge-fill $
<truncated 981 bytes>