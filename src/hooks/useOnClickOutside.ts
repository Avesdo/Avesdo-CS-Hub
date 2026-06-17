import { useEffect, RefObject } from 'react';

type Handler = (event: any) => void;

export function useOnClickOutside(ref: any, handler: Handler, active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: any) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Stop the click from bubbling to underlying Modals/Drawers
      event.stopPropagation();
      handler(event);
    };

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Stop the Escape from bubbling to underlying Modals/Drawers
        event.stopPropagation();
        handler(event);
      }
    };

    window.addEventListener('pointerdown', listener, true);
    window.addEventListener('keydown', keyListener, true);

    return () => {
      window.removeEventListener('pointerdown', listener, true);
      window.removeEventListener('keydown', keyListener, true);
    };
  }, [ref, handler, active]);
}
