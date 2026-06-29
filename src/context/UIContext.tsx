import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

export type DrawerType =
  | 'project'
  | 'service'
  | 'client'
  | 'dashDrilldown'
  | 'unscheduledProjects'
  | null;
export type ModalType = 'addClient' | 'addProject' | 'addService' | 'scheduleModal' | null;

export interface DrawerState {
  type: DrawerType;
  entityId?: string;
  data?: any;
  isClosing?: boolean;
}

interface UIContextType {
  activeModal: ModalType;
  activeModals: ModalType[];
  isModalOpen: (modal: ModalType) => boolean;
  activeDrawers: DrawerState[];
  activeDrawer: DrawerState; // For backwards compatibility, returns top of stack
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  openDrawer: (type: DrawerType, entityId?: string, data?: any) => void;
  closeDrawer: () => void;
  isDrawerOpen: (type: DrawerType) => boolean;
  getDrawerData: (type: DrawerType) => DrawerState | undefined;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModals, setActiveModals] = useState<ModalType[]>([]);
  const [activeDrawers, setActiveDrawers] = useState<DrawerState[]>([]);

  // URL Sync Listener
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      let drawer = params.get('drawer') as DrawerType;
      let drawerId = params.get('drawerId');

      // Check for new pretty URLs if old style isn't present
      if (!drawer) {
        if (params.get('project')) {
          drawer = 'project';
          drawerId = params.get('project');
        } else if (params.get('client')) {
          drawer = 'client';
          drawerId = params.get('client');
        } else if (params.get('service')) {
          drawer = 'service';
          drawerId = params.get('service');
        }
      }

      if (drawer) {
        setActiveDrawers((prev) => {
          if (prev.some((d) => d.type === drawer && d.entityId === drawerId)) return prev;
          return [...prev, { type: drawer, entityId: drawerId || undefined }];
        });
      } else {
        setActiveDrawers((prev) => {
          if (prev.length === 0) return prev;
          return [];
        });
      }
    };

    window.addEventListener('popstate', syncFromUrl);
    syncFromUrl(); // initial load

    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const updateUrl = (drawers: DrawerState[]) => {
    const newUrl = new URL(window.location.href);
    const visibleDrawers = drawers.filter((d) => !d.isClosing);

    if (visibleDrawers.length === 0) {
      newUrl.searchParams.delete('drawer');
      newUrl.searchParams.delete('drawerId');
      newUrl.searchParams.delete('project');
      newUrl.searchParams.delete('client');
      newUrl.searchParams.delete('service');
    } else {
      const top = visibleDrawers[visibleDrawers.length - 1];
      if (top && top.type) {
        // Clear all possible drawer params first to ensure clean state
        newUrl.searchParams.delete('drawer');
        newUrl.searchParams.delete('drawerId');
        newUrl.searchParams.delete('project');
        newUrl.searchParams.delete('client');
        newUrl.searchParams.delete('service');

        if (['project', 'client', 'service'].includes(top.type)) {
          if (top.entityId) {
            let slugOrId = top.entityId;
            // Attempt to resolve slug from global state to keep URL pretty
            import('../store/useAppStore').then(({ useAppStore }) => {
              const state = useAppStore.getState();
              if (top.type === 'project') {
                const p = state.projects.find(
                  (x: any) => x.id === top.entityId || x.slug === top.entityId
                );
                if (p?.slug) slugOrId = p.slug;
              } else if (top.type === 'client') {
                const c = state.clients.find(
                  (x: any) =>
                    x.clientId === top.entityId || x.id === top.entityId || x.slug === top.entityId
                );
                if (c?.slug) slugOrId = c.slug;
              } else if (top.type === 'service') {
                const s = state.services.find(
                  (x: any) => x.id === top.entityId || x.slug === top.entityId
                );
                if (s?.slug) slugOrId = s.slug;
              }
              newUrl.searchParams.set(top.type as string, slugOrId);
              window.history.replaceState({}, '', newUrl.toString());
            });
          } else {
            // Fallback if no entityId is somehow passed
            newUrl.searchParams.set('drawer', top.type as string);
            window.history.pushState({}, '', newUrl.toString());
          }
        } else {
          // Standard fallback for other drawers like 'dashDrilldown'
          newUrl.searchParams.set('drawer', top.type as string);
          if (top.entityId) newUrl.searchParams.set('drawerId', top.entityId);
          window.history.pushState({}, '', newUrl.toString());
        }
      }
    }

    // For non-async updates (like closing drawers), run synchronously
    if (
      visibleDrawers.length === 0 ||
      !['project', 'client', 'service'].includes(
        visibleDrawers[visibleDrawers.length - 1]?.type as string
      )
    ) {
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const openModal = useCallback((modal: ModalType) => {
    if (modal === null) setActiveModals([]);
    else setActiveModals((prev) => [...prev, modal]);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModals((prev) => prev.slice(0, -1));
  }, []);

  const openDrawer = useCallback((type: DrawerType, entityId?: string, data?: any) => {
    if (type === null) {
      setActiveDrawers([]);
      updateUrl([]);
    } else {
      setActiveDrawers((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        const next = [...filtered, { type, entityId, data }];
        updateUrl(next);
        return next;
      });
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawers((prev) => {
      if (prev.length === 0) return prev;
      if (prev[prev.length - 1].isClosing) return prev; // Already closing
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], isClosing: true };

      // Update URL immediately to reflect the drawer that WILL be visible
      const visible = copy.filter((d) => !d.isClosing);
      updateUrl(visible);

      return copy;
    });

    setTimeout(() => {
      setActiveDrawers((prev) => {
        return prev.filter((d) => !d.isClosing);
      });
    }, 300);
  }, []);

  // ESC Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only handle drawers globally, let Modals handle their own Escape events natively
        // to preserve unsaved changes confirmations and strict focus trapping.
        if (activeDrawers.length > 0 && activeModals.length === 0) {
          closeDrawer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModals, activeDrawers, closeModal, closeDrawer]);

  const isDrawerOpen = (type: DrawerType) => activeDrawers.some((d) => d.type === type);
  const getDrawerData = (type: DrawerType) => activeDrawers.find((d) => d.type === type);
  const isModalOpen = (modal: ModalType) => activeModals.includes(modal);

  const activeModal = activeModals.length > 0 ? activeModals[activeModals.length - 1] : null;
  const activeDrawer =
    activeDrawers.length > 0 ? activeDrawers[activeDrawers.length - 1] : { type: null };

  return (
    <UIContext.Provider
      value={{
        activeModal,
        activeModals,
        isModalOpen,
        activeDrawers,
        activeDrawer,
        openModal,
        closeModal,
        openDrawer,
        closeDrawer,
        isDrawerOpen,
        getDrawerData,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
