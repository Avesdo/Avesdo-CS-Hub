import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

  const openModal = (modal: ModalType) => {
    if (modal === null) setActiveModals([]);
    else setActiveModals((prev) => [...prev, modal]);
  };

  const closeModal = () => {
    setActiveModals((prev) => prev.slice(0, -1));
  };

  const openDrawer = (type: DrawerType, entityId?: string, data?: any) => {
    if (type === null) {
      setActiveDrawers([]);
    } else {
      // If this drawer type is already open, replace it to prevent duplicates of the same type
      setActiveDrawers((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        return [...filtered, { type, entityId, data }];
      });
    }
  };

  const closeDrawer = () => {
    setActiveDrawers((prev) => {
      if (prev.length === 0) return prev;
      if (prev[prev.length - 1].isClosing) return prev; // Already closing
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], isClosing: true };
      return copy;
    });

    setTimeout(() => {
      setActiveDrawers((prev) => {
        // Only remove the one that was marked as closing if it's at the top
        // Actually, just filter out all that are isClosing
        return prev.filter((d) => !d.isClosing);
      });
    }, 300);
  };

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
