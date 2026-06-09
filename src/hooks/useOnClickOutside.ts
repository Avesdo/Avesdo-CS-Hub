import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent | KeyboardEvent) => void;

export function useOnClickOutside(
  ref: any,
  handler: Handler,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;
    
    const listener = (event: MouseEvent | TouchEvent) => {
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

    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);
    document.addEventListener('keydown', keyListener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
      document.removeEventListener('keydown', keyListener, true);
    };
  }, [ref, handler, active]);
}
