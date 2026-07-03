import { create } from 'zustand';

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

interface UIStore {
  activeModals: ModalType[];
  activeDrawers: DrawerState[];
  isModalOpen: (modal: ModalType) => boolean;
  activeModal: ModalType | null;
  activeDrawer: DrawerState;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  openDrawer: (type: DrawerType, entityId?: string, data?: any) => void;
  closeDrawer: () => void;
  isDrawerOpen: (type: DrawerType) => boolean;
  getDrawerData: (type: DrawerType) => DrawerState | undefined;
  syncFromUrl: () => void;
}

export const useUIStore = create<UIStore>((set, get) => {
  const updateUrl = (drawers: DrawerState[]) => {
    if (typeof window === 'undefined') return;
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
        newUrl.searchParams.delete('drawer');
        newUrl.searchParams.delete('drawerId');
        newUrl.searchParams.delete('project');
        newUrl.searchParams.delete('client');
        newUrl.searchParams.delete('service');

        if (['project', 'client', 'service'].includes(top.type)) {
          if (top.entityId) {
            let slugOrId = top.entityId;
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
            newUrl.searchParams.set('drawer', top.type as string);
            window.history.pushState({}, '', newUrl.toString());
          }
        } else {
          newUrl.searchParams.set('drawer', top.type as string);
          if (top.entityId) newUrl.searchParams.set('drawerId', top.entityId);
          window.history.pushState({}, '', newUrl.toString());
        }
      }
    }

    if (
      visibleDrawers.length === 0 ||
      !['project', 'client', 'service'].includes(
        visibleDrawers[visibleDrawers.length - 1]?.type as string
      )
    ) {
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  return {
    activeModals: [],
    activeDrawers: [],
    activeModal: null,
    activeDrawer: { type: null },

    isModalOpen: (modal) => get().activeModals.includes(modal),

    openModal: (modal) => {
      set((state) => {
        if (modal === null) return { activeModals: [], activeModal: null };
        const newModals = [...state.activeModals, modal];
        return {
          activeModals: newModals,
          activeModal: modal,
        };
      });
    },

    closeModal: () => {
      set((state) => {
        const newModals = state.activeModals.slice(0, -1);
        return {
          activeModals: newModals,
          activeModal: newModals.length > 0 ? newModals[newModals.length - 1] : null,
        };
      });
    },

    openDrawer: (type, entityId, data) => {
      if (type === null) {
        set({ activeDrawers: [], activeDrawer: { type: null } });
        updateUrl([]);
      } else {
        set((state) => {
          const filtered = state.activeDrawers.filter((d) => d.type !== type);
          const newDrawer = { type, entityId, data };
          const next = [...filtered, newDrawer];
          updateUrl(next);
          return { activeDrawers: next, activeDrawer: newDrawer };
        });
      }
    },

    closeDrawer: () => {
      const state = get();
      const prev = state.activeDrawers;
      if (prev.length === 0) return;
      if (prev[prev.length - 1].isClosing) return;

      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], isClosing: true };

      const visible = copy.filter((d) => !d.isClosing);
      updateUrl(visible);

      set({ activeDrawers: copy, activeDrawer: copy[copy.length - 1] });

      setTimeout(() => {
        set((s) => {
          const nextDrawers = s.activeDrawers.filter((d) => !d.isClosing);
          return {
            activeDrawers: nextDrawers,
            activeDrawer:
              nextDrawers.length > 0 ? nextDrawers[nextDrawers.length - 1] : { type: null },
          };
        });
      }, 300);
    },

    isDrawerOpen: (type) => get().activeDrawers.some((d) => d.type === type),
    getDrawerData: (type) => get().activeDrawers.find((d) => d.type === type),

    syncFromUrl: () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      let drawer = params.get('drawer') as DrawerType;
      let drawerId = params.get('drawerId');

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
        set((state) => {
          if (state.activeDrawers.some((d) => d.type === drawer && d.entityId === drawerId)) {
            return state;
          }
          const nextDrawers = [
            ...state.activeDrawers,
            { type: drawer, entityId: drawerId || undefined },
          ];
          return {
            activeDrawers: nextDrawers,
            activeDrawer: nextDrawers[nextDrawers.length - 1],
          };
        });
      } else {
        set((state) => {
          if (state.activeDrawers.length === 0) return state;
          return { activeDrawers: [], activeDrawer: { type: null } };
        });
      }
    },
  };
});

if (typeof window !== 'undefined') {
  // Sync URL on initial load
  useUIStore.getState().syncFromUrl();

  window.addEventListener('popstate', () => {
    useUIStore.getState().syncFromUrl();
  });

  // Global Esc listener for drawers (Modals handle themselves via Radix)
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const state = useUIStore.getState();
      if (state.activeDrawers.length > 0 && state.activeModals.length === 0) {
        state.closeDrawer();
      }
    }
  });
}
