import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building, Box, Briefcase, SearchX } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useUI } from '../context/UIContext';
import { getHealthBadge, getSettingBadge } from '../utils/uiUtils';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export default function GlobalSearch() {
  const { clients, projects, services, settings } = useAppState();
  const { openDrawer, closeDrawer, closeModal, activeDrawers, activeModal } = useUI();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [viewAll, setViewAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useOnClickOutside(
    containerRef,
    () => {
      setIsOpen(false);
      setQuery('');
      setViewAll(false);
    },
    isOpen
  );

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

  const handleResultClick = (type: 'client' | 'project' | 'service', id: string) => {
    setIsOpen(false);
    setQuery('');
    setViewAll(false);

    // Unfocus the input if needed
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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

  const activeQuery = debouncedQuery.trim().toLowerCase();
  const hasEnoughChars = activeQuery.length >= 2;

  const cMatches = [];
  const pMatches = [];
  const sMatches = [];

  if (hasEnoughChars) {
    // Search Clients
    for (const c of clients) {
      const cName = c.companyName?.toLowerCase() || '';
      const cManager = c.accountManager?.toLowerCase() || '';
      if (cName.includes(activeQuery) || cManager.includes(activeQuery)) {
        cMatches.push(c);
      }
    }

    // Search Projects
    for (const p of projects) {
      const pName = p.name?.toLowerCase() || '';
      const pAssignee = p.assignee?.toLowerCase() || '';
      const pClients = (p.clients || []).join(' ').toLowerCase();
      if (
        pName.includes(activeQuery) ||
        pAssignee.includes(activeQuery) ||
        pClients.includes(activeQuery)
      ) {
        pMatches.push(p);
      }
    }

    // Search Services
    for (const s of services) {
      const sName = s.name?.toLowerCase() || '';
      const sClient = s.clientName?.toLowerCase() || '';
      const sInvoice = s.invoiceNum?.toLowerCase() || '';
      if (
        sName.includes(activeQuery) ||
        sClient.includes(activeQuery) ||
        sInvoice.includes(activeQuery)
      ) {
        sMatches.push(s);
      }
    }
  }

  const matchedClients = viewAll ? cMatches : cMatches.slice(0, 4);
  const matchedProjects = viewAll ? pMatches : pMatches.slice(0, 4);
  const matchedServices = viewAll ? sMatches : sMatches.slice(0, 4);

  const totalMatches = cMatches.length + pMatches.length + sMatches.length;
  const totalResults = matchedClients.length + matchedProjects.length + matchedServices.length;
  const showResults = isOpen && hasEnoughChars;
  const hasMore = totalMatches > totalResults;

  const allResults = [
    ...matchedClients.map((c) => ({ type: 'client' as const, id: c.id })),
    ...matchedProjects.map((p) => ({ type: 'project' as const, id: p.id })),
    ...matchedServices.map((s) => ({ type: 'service' as const, id: s.id })),
  ];

  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery, isOpen]);

  let globalItemIndex = 0;

  return (
    <div
      className="relative max-w-[500px] hidden md:block flex-grow"
      ref={containerRef}
      id="global-search-container"
    >
      <Search
        className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${isOpen && query.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="global-search-listbox"
        aria-autocomplete="list"
        placeholder="Search clients, projects, or services..."
        className={`w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-all outline-none placeholder:text-muted-foreground pl-8 pr-8 h-9 focus:border-primary focus:ring-2 focus:ring-primary/20 ${isOpen && query.length > 0 ? 'border-primary' : 'border-input'}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            setIsOpen(false);
            setQuery('');
            setViewAll(false);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (isOpen && allResults.length > 0) {
              setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen && allResults.length > 0) {
              setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && selectedIndex >= 0 && selectedIndex < allResults.length) {
              const result = allResults[selectedIndex];
              handleResultClick(result.type, result.id);
            }
          }
        }}
      />
      {query.length > 0 && (
        <button
          onClick={() => {
            setQuery('');
            setIsOpen(false);
            setViewAll(false);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors active:scale-95 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {showResults && (
        <div
          id="global-search-listbox"
          role="listbox"
          className="absolute top-full left-0 w-full min-w-[500px] bg-white mt-2 rounded-xl border border-border shadow-xl z-50 max-h-[80vh] overflow-y-auto custom-thin-scroll flex flex-col"
        >
          {totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <SearchX className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-semibold">No matches found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="py-2">
              {matchedClients.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Building className="w-3.5 h-3.5" />
                    Clients
                  </div>
                  <div className="px-2 pt-1">
                    {matchedClients.map((c) => {
                      const isSelected = globalItemIndex === selectedIndex;
                      globalItemIndex++;
                      return (
                        <div
                          key={c.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleResultClick('client', c.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group active:scale-95 ${isSelected ? 'bg-accent' : 'hover:bg-accent'}`}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span
                              className={`text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}
                            >
                              {c.companyName}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5">
                              Manager: {c.accountManager || 'Unassigned'}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4">
                            {getHealthBadge(c.healthScore, settings)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchedProjects.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Box className="w-3.5 h-3.5" />
                    Projects
                  </div>
                  <div className="px-2 pt-1">
                    {matchedProjects.map((p) => {
                      const isSelected = globalItemIndex === selectedIndex;
                      globalItemIndex++;
                      return (
                        <div
                          key={p.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleResultClick('project', p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group active:scale-95 ${isSelected ? 'bg-accent' : 'hover:bg-accent'}`}
                        >
                          <div className="flex flex-col overflow-hidden pr-3">
                            <span
                              className={`text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}
                            >
                              {p.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5 truncate max-w-[220px]">
                              {(p.clients || []).join(', ') || 'Not Set'}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4">
                            {getSettingBadge('statuses', p.projectStatus, settings)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchedServices.length > 0 && (
                <div>
                  <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5" />
                    Services & Billings
                  </div>
                  <div className="px-2 pt-1">
                    {matchedServices.map((s) => {
                      const isSelected = globalItemIndex === selectedIndex;
                      globalItemIndex++;
                      return (
                        <div
                          key={s.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleResultClick('service', s.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group active:scale-95 ${isSelected ? 'bg-accent' : 'hover:bg-accent'}`}
                        >
                          <div className="flex flex-col overflow-hidden pr-3">
                            <span
                              className={`text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}
                            >
                              {s.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5">
                              {s.clientName || 'Not Set'} {s.manager ? `• ${s.manager}` : ''}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4">
                            <span className="px-2.5 py-1 bg-white border border-border rounded-md text-sm font-bold text-foreground shadow-sm">
                              {formatCurrency(s.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasMore && !viewAll && (
                <div className="p-2 sticky bottom-0 bg-white/95 backdrop-blur border-t border-border mt-2">
                  <button
                    className="w-full py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setViewAll(true);
                      // Optional: refocus input if desired
                    }}
                  >
                    View all {totalMatches} results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
