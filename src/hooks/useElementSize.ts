import { useState, useEffect, RefObject } from 'react';
export function useElementSize<T extends HTMLElement>(ref: RefObject<T>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height: el.offsetHeight });
    });
    observer.observe(el);
    setSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
