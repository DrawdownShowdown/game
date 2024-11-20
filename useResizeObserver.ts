import { useEffect, useState, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

export const useResizeObserver = (ref: React.RefObject<HTMLElement>): Size | undefined => {
  const [size, setSize] = useState<Size>();
  const observerRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (!ref.current) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new ResizeObserver(entries => {
      if (!Array.isArray(entries) || !entries.length) return;

      const entry = entries[0];
      const { width, height } = entry.contentRect;

      // Only update if dimensions actually changed
      setSize(prevSize => {
        if (prevSize?.width === width && prevSize?.height === height) {
          return prevSize;
        }
        return { width, height };
      });
    });

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref]);

  return size;
};