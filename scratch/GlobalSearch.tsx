import React, { useState, useEffect } from 'react';
import { Building, Box, Briefcase, Search, PlusCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useUI } from '../context/UIContext';
import { Button } from './ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const clients = useAppStore(state => state.clients);
  const projects = useAppStore(state => state.projects);
  const services = useAppStore(state => state.services);
  const { openDrawer, closeDrawer, closeModal, openModal, activeDrawers, activeModal } = useUI();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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

  const handleSelect = (type: 'client' | 'project' | 'service', id: string) => {
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

  const handleAction = (modalType: 'client_create' | 'project_create' | 'service_create') => {
    setOpen(false);
    openModal(modalType);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80 hover:bg-muted/80 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search data or actions...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleAction('client_create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Create New Client</span>
            </CommandItem>
            <CommandItem onSelect={() => handleAction('project_create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Create New Project</span>
            </CommandItem>
            <CommandItem onSelect={() => handleAction('service_create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Log New Service</span>
            </CommandItem>
          </CommandGroup>

          {clients.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clients">
                {clients.map((c) => (
                  <CommandItem key={c.id} onSelect={() => handleSelect('client', c.id)}>
                    <Building className="mr-2 h-4 w-4 text-primary" />
                    <span>{c.companyName}</span>
                    {c.accountManager && <span className="ml-2 text-muted-foreground text-xs">{c.accountManager}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.map((p) => (
                  <CommandItem key={p.id} onSelect={() => handleSelect('project', p.id)}>
                    <Box className="mr-2 h-4 w-4 text-primary" />
                    <span>{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{(p.clients || []).join(', ')}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {services.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Services">
                {services.map((s) => (
                  <CommandItem key={s.id} onSelect={() => handleSelect('service', s.id)}>
                    <Briefcase className="mr-2 h-4 w-4 text-primary" />
                    <span>{s.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatCurrency(s.price)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
