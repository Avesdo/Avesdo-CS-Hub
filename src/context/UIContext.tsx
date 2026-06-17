import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

export type DrawerType =
  | 'client'
  | 'project'
  | 'service'
  | 'dashDrilldown'
  | 'unscheduledProjects'
  | null;
export type ModalType = 'addClient' | 'addProject' | 'addService' | null;

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
      const drawer = params.get('drawer') as DrawerType;
      const drawerId = params.get('drawerId');
      
      if (drawer) {
        setActiveDrawers((prev) => {
          if (prev.some(d => d.type === drawer && d.entityId === drawerId)) return prev;
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
    const visibleDrawers = drawers.filter(d => !d.isClosing);
    
    if (visibleDrawers.length === 0) {
      newUrl.searchParams.delete('drawer');
      newUrl.searchParams.delete('drawerId');
    } else {
      const top = visibleDrawers[visibleDrawers.length - 1];
      if (top && top.type) {
        newUrl.searchParams.set('drawer', top.type);
        if (top.entityId) newUrl.searchParams.set('drawerId', top.entityId);
        else newUrl.searchParams.delete('drawerId');
      }
    }
    window.history.pushState({}, '', newUrl.toString());
  };

  // ESC Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If there's an active modal, close the top one
        if (activeModals.length > 0) {
          setActiveModals((prev) => prev.slice(0, -1));
        }
        // Else if there's an active drawer, close the top one
        else if (activeDrawers.length > 0) {
          setActiveDrawers((prev) => {
            if (prev.length === 0) return prev;
            if (prev[prev.length - 1].isClosing) return prev;
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], isClosing: true };
            return copy;
          });
          setTimeout(() => {
            setActiveDrawers((prev) => prev.filter((d) => !d.isClosing));
          }, 300);
        }
      }
    };

    // Add event listener with capture phase so it runs before popover listeners
    // Wait, popovers stop propagation, so we shouldn't capture. If we use capture, we override them.
    // We want popovers to close FIRST. So we use bubble phase.
    // If popovers call e.stopPropagation(), this won't trigger. Perfect!
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModals, activeDrawers]);

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
