import React, { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { useAppStore } from '../store/useAppStore';
import { useUI } from '../context/UIContext';
import { getHealthBadge, getSettingBadge } from '../utils/uiUtils';
import { Building, Box, Briefcase, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const clients = useAppStore(state => state.clients);
  const projects = useAppStore(state => state.projects);
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);
  const { openDrawer, closeDrawer, closeModal, activeDrawers, activeModal } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);

    // Provide a global way to open the command menu from other components
    const openCommandMenu = () => setOpen(true);
    window.addEventListener('openCommandMenu', openCommandMenu);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('openCommandMenu', openCommandMenu);
    };
  }, []);

  const handleResultClick = (type: 'client' | 'project' | 'service', id: string) => {
    setOpen(false);

    const hasOpenOverlay = activeDrawers.length > 0 || activeModal !== null;

    closeDrawer();
    closeModal();

    if (hasOpenOverlay) {
      setTimeout(() => {
        if (type === 'service') openDrawer(type, id, { targetTab: 'details' });
        else openDrawer(type, id);
      }, 300);
    } else {
      if (type === 'service') openDrawer(type, id, { targetTab: 'details' });
      else openDrawer(type, id);
    }
  };

  const formatCurrency = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '$0.00';
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => { setOpen(false); navigate('/settings'); }}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Go to Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        
        {clients.length > 0 && (
          <CommandGroup heading="Clients">
            {clients.map((c) => (
              <CommandItem
                key={`client-${c.id}`}
                value={`client ${c.companyName} ${c.accountManager}`}
                onSelect={() => handleResultClick('client', c.id)}
              >
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{c.companyName}</span>
                <span className="text-xs text-muted-foreground mr-2">
                  Manager: {c.accountManager || 'Unassigned'}
                </span>
                {getHealthBadge(c.healthScore, settings)}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem
                key={`project-${p.id}`}
                value={`project ${p.name} ${(p.clients || []).join(' ')}`}
                onSelect={() => handleResultClick('project', p.id)}
              >
                <Box className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground mr-2 truncate max-w-[150px]">
                  {(p.clients || []).join(', ')}
                </span>
                {getSettingBadge('statuses', p.projectStatus, settings)}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {services.length > 0 && (
          <CommandGroup heading="Services">
            {services.map((s) => (
              <CommandItem
                key={`service-${s.id}`}
                value={`service ${s.name} ${s.clientName} ${s.invoiceNum}`}
                onSelect={() => handleResultClick('service', s.id)}
              >
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground mr-2">
                  {s.clientName || 'Not Set'}
                </span>
                <span className="px-2 py-0.5 bg-muted border border-border rounded text-xs font-semibold">
                  {formatCurrency(s.price)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}