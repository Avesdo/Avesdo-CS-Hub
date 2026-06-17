import re

with open('src/context/UIContext.tsx', 'r') as f:
    content = f.read()

# Add URL syncing to useEffect
url_sync_effect = '''  // URL Sync Listener
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
'''

content = content.replace(
    '  // ESC Listener',
    url_sync_effect + '\n  // ESC Listener'
)

# Call updateUrl in openDrawer
open_drawer_orig = '''  const openDrawer = useCallback((type: DrawerType, entityId?: string, data?: any) => {
    if (type === null) {
      setActiveDrawers([]);
    } else {
      // If this drawer type is already open, replace it to prevent duplicates of the same type
      setActiveDrawers((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        return [...filtered, { type, entityId, data }];
      });
    }
  }, []);'''

open_drawer_new = '''  const openDrawer = useCallback((type: DrawerType, entityId?: string, data?: any) => {
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
  }, []);'''

content = content.replace(open_drawer_orig, open_drawer_new)

# Call updateUrl in closeDrawer
close_drawer_orig = '''  const closeDrawer = useCallback(() => {
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
  }, []);'''

close_drawer_new = '''  const closeDrawer = useCallback(() => {
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
  }, []);'''

content = content.replace(close_drawer_orig, close_drawer_new)

with open('src/context/UIContext.tsx', 'w') as f:
    f.write(content)

print("Done UIContext update")
