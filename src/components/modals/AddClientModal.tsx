import React, { useState } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { updateClientRecord, addAutoLog } from '../../api/dbService';
import { Client } from '../../types';

import { Select } from '../ui/Select';

export default function AddClientModal() {
  const { isModalOpen, closeModal, openDrawer } = useUI();
  const { settings, clients, user } = useAppState();
  
  const [companyName, setCompanyName] = useState('');
  const [clientType, setClientType] = useState('');
  const [accountManager, setAccountManager] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isOpen = isModalOpen('addClient');

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!companyName.trim()) {
      setErrorMsg("Client Name is required.");
      return;
    }
    if (!clientType) {
      setErrorMsg("Client Type is required.");
      return;
    }

    const nameExists = clients.some(c => c.companyName.toLowerCase() === companyName.trim().toLowerCase());
    if (nameExists) {
      setErrorMsg("A client with this Client Name already exists.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newClientId = crypto.randomUUID().substring(0, 8).toUpperCase();
      const newClient: Client = {
        id: crypto.randomUUID(),
        clientId: newClientId,
        companyName: companyName.trim(),
        clientType,
        accountManager: accountManager || "Unassigned",
        activeProjectCount: 0,
        healthScore: "N/A",
        billing: 100,
        dateAdded: new Date().getTime(),
        lastUpdated: new Date().getTime(),
        scoreTrajectory: []
      };

      await updateClientRecord(newClient, {
        successMsg: `Client '${companyName.trim()}' successfully created.`,
        errorMsg: `Failed to create client '${companyName.trim()}'.`
      });
      
      const logMessage = note ? `Client profile created. Initial Note: ${note}` : `Client profile created.`;
      await addAutoLog(newClientId, logMessage, user?.name || 'System');
      
      // Reset form
      setCompanyName('');
      setClientType('');
      setAccountManager('');
      setNote('');
      handleClose();

      // Seamless Routing Handoff
      if (isModalOpen('addProject')) {
        window.dispatchEvent(new CustomEvent('clientCreated', { detail: newClientId }));
      } else {
        setTimeout(() => {
          openDrawer('client', newClient.id);
        }, 350);
      }
      
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while creating the client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 140 }}></div>
      
      <div 
        className={`fixed inset-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:py-12 flex items-start justify-center custom-thin-scroll transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 150 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className={`relative w-full max-w-md bg-white border border-border rounded-xl shadow-2xl flex flex-col my-auto text-card-foreground transition-all duration-200 ease-out transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">Add New Client</h3>
            <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        <div className="p-6 custom-thin-scroll overflow-visible">
          {errorMsg && (
            <div id="ac-error" className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
              {errorMsg}
            </div>
          )}
          
          <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Client Name <span className="text-destructive">*</span></label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setErrorMsg(''); }}
                className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 h-[38px] placeholder:text-muted-foreground" 
                placeholder="Enter client name..." 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Client Type <span className="text-destructive">*</span></label>
              <Select 
                value={clientType} 
                options={(settings?.clientTypes?.map(t => t.name) || []).map(t => ({ label: t, value: t }))} 
                onChange={(val) => { setClientType(val); setErrorMsg(''); }} 
                className="w-full block"
                trigger={
                  <button type="button" className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm">
                    <span className={`truncate ${clientType ? 'text-foreground' : 'text-muted-foreground'}`}>{clientType || 'Select Type'}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                }
              />
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Manager</label>
              <Select 
                value={accountManager} 
                options={(settings?.managers?.map(m => m.name) || []).map(m => ({ label: m, value: m }))} 
                onChange={setAccountManager} 
                className="w-full block"
                trigger={
                  <button type="button" className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm">
                    <span className={`truncate ${accountManager ? 'text-foreground' : 'text-muted-foreground'}`}>{accountManager || 'Select Manager'}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                }
              />
            </div>
            <div className="pt-3 border-t border-border/50">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-2">Initial Note <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <textarea 
                rows={3} 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-auto resize-none custom-thin-scroll" 
                placeholder="Enter an optional note..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-xl">
          <button onClick={handleClose} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
