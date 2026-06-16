import { useEffect, useState } from 'react';

export function useIntersectionObserver(callback: () => void, rootMargin = '100px') {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      observer.disconnect();
    };
  }, [node, callback, rootMargin]);

  return setNode;
}
