import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { updateServiceRecord, addAutoLog, addProjectAutoLog, addServiceAutoLog } from '../../api/dbService';
import { Service } from '../../types';
import toast from 'react-hot-toast';

import { Select } from '../ui/Select';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

import { CreatableSelect } from '../ui/CreatableSelect';
export default function AddServiceModal() {
  const { isModalOpen, closeModal, activeDrawer, openDrawer } = useUI();
  const { clients, projects, settings, user } = useAppState();
  
  const [serviceName, setServiceName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignee, setAssignee] = useState('');
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isOpen = isModalOpen('addService');

  // Pre-fill context if opened from a specific drawer
  useEffect(() => {
      if (isOpen) {
          if (activeDrawer && activeDrawer.type === 'client' && activeDrawer.data) {
              const cId = activeDrawer.data.clientId || activeDrawer.data.id;
              if (cId) setSelectedClient(cId);
          } else if (activeDrawer && activeDrawer.type === 'project' && activeDrawer.data) {
              const pId = activeDrawer.data.id;
              const pClientName = activeDrawer.data.clients?.[0];
              const cObj = clients.find(c => c.companyName === pClientName || c.name === pClientName);
              if (cObj) {
                  setSelectedClient(cObj.clientId || cObj.id);
                  setSelectedProject(pId);
              }
          }
      }
  }, [isOpen, activeDrawer, clients]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (type === 'Included') {
      setPrice('0');
    } else if (type === 'Additional') {
      const predefinedService = settings?.services?.find((s: any) => s.name === serviceName);
      if (predefinedService) {
        setPrice(new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(predefinedService.price));
      }
    }
  }, [type, serviceName, settings]);

  const availableProjects = useMemo(() => {
    const defaultOption = { id: 'none', name: 'None (Client Level)' };
    if (!selectedClient) return [defaultOption];
    const client = clients.find(c => (c.clientId || c.id) === selectedClient);
    if (!client) return [defaultOption];
    const filtered = projects.filter(p => p.clientIds?.includes(client.clientId || client.id) || p.clients?.includes(client.companyName || client.name));
    return [defaultOption, ...filtered];
  }, [selectedClient, clients, projects]);

  const serviceOptions = useMemo(() => settings?.services?.map((s: any) => s.name) || [], [settings?.services]);
  const typeOptions = useMemo(() => (settings?.serviceTypes?.map((t: any) => t.name) || []).map((t: any) => ({ label: t, value: t })), [settings?.serviceTypes]);
  const clientOptions = useMemo(() => clients.map(c => ({ value: c.clientId || c.id, label: c.companyName || c.name })), [clients]);
  const managerOptions = useMemo(() => (settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({ label: m, value: m })), [settings?.managers]);

  if (!shouldRender) return null;

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!serviceName.trim()) {
      setErrorMsg("Service Name is required.");
      return;
    }
    if (!type) {
      setErrorMsg("Service Type is required.");
      return;
    }
    if (!selectedClient) {
      setErrorMsg("Client is required.");
      return;
    }
    if (type !== 'Included') {
      if (!price.trim()) {
        setErrorMsg("Price is required.");
        return;
      }
      const num = parseFloat(price.replace(/,/g, ''));
      if (isNaN(num)) {
        setErrorMsg("Price must be a valid number.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const clientObj = clients.find(c => (c.clientId || c.id) === selectedClient);
      const projectObj = selectedProject && selectedProject !== 'none' ? projects.find(p => p.id === selectedProject) : null;
      
      const serviceId = crypto.randomUUID();
      const today = new Date();
      const newService: Service = {
        id: serviceId,
        serviceId: serviceId.substring(0, 8).toLowerCase(),
        serviceName: serviceName.trim(),
        name: serviceName.trim(),
        type: type,
        status: 'Proposal Sent',
        clientName: clientObj?.companyName || clientObj?.name || 'Unknown',
        clientIds: clientObj ? [clientObj.clientId || clientObj.id] : [],
        clients: clientObj ? [clientObj.companyName || clientObj.name] : [],
        projectName: projectObj ? projectObj.name : 'N/A',
        projectId: projectObj ? projectObj.id : 'N/A',
        assignee: assignee || 'Unassigned',
        manager: assignee || 'Unassigned',
        price: price ? parseFloat(price.replace(/,/g, '')) : 0,
        contactName,
        outcome: 'Proposal Sent',
        invoiceSent: false,
        commissionPaid: false,
        dateVal: today.getTime(),
        dateStr: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dateAdded: today.getTime(),
        lastUpdated: today.getTime()
      };

      await updateServiceRecord(newService, {
        successMsg: `Service '${serviceName.trim()}' successfully added.`,
        errorMsg: `Failed to add service '${serviceName.trim()}'.`
      });
      
      const baseLogMsg = `New service added: ${serviceName.trim()}`;
      const logMessage = note ? `${baseLogMsg}. Initial Note: ${note}` : baseLogMsg;
      
      const logPromises = [
        addServiceAutoLog(serviceId, logMessage, user?.name || 'System')
      ];
      if (clientObj) {
         logPromises.push(addAutoLog(clientObj.clientId || clientObj.id, logMessage, user?.name || 'System', true));
      }
      if (projectObj) {
         logPromises.push(addProjectAutoLog(projectObj.id, logMessage, user?.name || 'System', true));
      }
      await Promise.all(logPromises);
      

      
      setServiceName('');
      setType('');
      setPrice('');
      setSelectedClient('');
      setSelectedProject('');
      setAssignee('');
      setContactName('');
      setNote('');
      
      setTimeout(() => {
        openDrawer('service', serviceId);
      }, 350);
      
      handleClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
      <div 
        className={`fixed inset-0 z-[130] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:py-12 flex items-start justify-center custom-thin-scroll transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className={`relative w-full max-w-lg bg-white border border-border rounded-xl shadow-2xl flex flex-col my-auto text-card-foreground transition-all duration-200 ease-out transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">Add New Service</h3>
            <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 flex-1">
            {errorMsg && (
              <div id="as-error" className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
                {errorMsg}
              </div>
            )}
            
            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Service Name <span className="text-destructive">*</span></label>
                <CreatableSelect 
                  value={serviceName}
                  options={serviceOptions}
                  onChange={(val) => { setServiceName(val); setErrorMsg(''); }}
                  placeholder="Select or enter a service name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5 pt-2">
                <div className={type === 'Included' ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Service Type <span className="text-destructive">*</span></label>
                  <Select 
                    value={type} 
                    options={typeOptions} 
                    onChange={(val) => { setType(val); setErrorMsg(''); }} 
                    className="w-full block"
                    trigger={
                      <button type="button" className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm">
                        <span className={`truncate ${type ? 'text-foreground' : 'text-muted-foreground'}`}>{type || 'Select Service Type'}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    }
                  />
                </div>
                {type !== 'Included' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Service Value <span className="text-destructive">*</span></label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground font-semibold text-sm">$</span>
                      <input 
                        type="text" 
                        value={price}
                        onChange={(e) => { setPrice(e.target.value); setErrorMsg(''); }}
                        onBlur={() => {
                          const num = parseFloat(price.replace(/,/g, ''));
                          if (!isNaN(num)) {
                            setPrice(new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num));
                          }
                        }}
                        className="w-full min-w-0 rounded-md border border-input bg-white pl-7 pr-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 h-[38px] text-sm" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Client Name <span className="text-destructive">*</span></label>
                  <Select 
                    value={selectedClient} 
                    options={clientOptions} 
                    onChange={(val) => { setSelectedClient(val); setSelectedProject(''); setErrorMsg(''); }} 
                    className="w-full block"
                    trigger={
                      <button type="button" className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm">
                        <span className={`truncate ${selectedClient ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {clientOptions.find(c => c.value === selectedClient)?.label || 'Select Client'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Project Name</label>
                  <Select 
                    value={selectedProject} 
                    options={availableProjects.map(p => ({ value: p.id, label: p.name }))} 
                    onChange={setSelectedProject} 
                    className="w-full block"
                    trigger={
                      <button type="button" disabled={!selectedClient} className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm disabled:opacity-50 disabled:bg-slate-50 disabled:pointer-events-none">
                        <span className={`truncate ${selectedProject ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {availableProjects.find(p => p.id === selectedProject)?.name || 'Select Project'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Manager</label>
                <Select 
                  value={assignee} 
                  options={managerOptions} 
                  onChange={setAssignee} 
                  className="w-full block"
                  trigger={
                    <button type="button" className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm">
                      <span className={`truncate ${assignee ? 'text-foreground' : 'text-muted-foreground'}`}>{assignee || 'Select Manager'}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  }
                />
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Client Contact Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-[38px]" 
                  placeholder="Enter primary contact name..." 
                />
              </div>
              <div className="pt-3 border-t border-border/50">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Initial Note <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <textarea 
                  rows={2} 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-auto resize-none custom-thin-scroll" 
                  placeholder="Enter an optional note..."
                ></textarea>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-xl mt-auto">
            <button onClick={handleClose} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
