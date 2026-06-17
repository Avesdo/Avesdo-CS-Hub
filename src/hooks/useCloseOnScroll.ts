import { useEffect } from 'react';

export function useCloseOnScroll(
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  popoverRef?: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      // Ignore scroll events originating from within the popover itself
      if (
        popoverRef?.current &&
        e.target instanceof Node &&
        popoverRef.current.contains(e.target)
      ) {
        return;
      }
      
      // Also ignore if the scroll target is a Radix Select/Dropdown content to be safe
      if (e.target instanceof Element && e.target.closest('[role="menu"], [role="listbox"], [role="dialog"]')) {
         return;
      }

      setIsOpen(false);
    };

    // Use capture phase to ensure we catch all scroll events, even on elements that don't bubble
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, setIsOpen, popoverRef]);
}
