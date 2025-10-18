import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export function useInViewport(
  elementRef: RefObject<Element>,
  unobserveOnIntersect = false,
  options: IntersectionObserverInit = {},
  shouldObserve = true
): boolean {
  const [intersect, setIntersect] = useState(false);
  const [isUnobserved, setIsUnobserved] = useState(false);

  useEffect(() => {
    const target = elementRef.current;

    if (!target) return undefined;

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry) return;

      const { isIntersecting } = entry;

      setIntersect(isIntersecting);

      if (isIntersecting && unobserveOnIntersect) {
        observer.unobserve(entry.target);
        setIsUnobserved(true);
      }
    }, options);

    if (!isUnobserved && shouldObserve) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [elementRef, isUnobserved, options, shouldObserve, unobserveOnIntersect]);

  return intersect;
}
