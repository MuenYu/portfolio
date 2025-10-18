import { useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';
import { useCallback, useRef } from 'react';

export function useScrollToHash(): (hash: string, onDone?: () => void) => () => void {
  const scrollTimeout = useRef<ReturnType<typeof window.setTimeout> | undefined>(
    undefined
  );
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const scrollToHash = useCallback(
    (hash: string, onDone?: () => void) => {
      const noop = () => {};
      const id = hash.split('#')[1];
      if (!id) return noop;

      const targetElement = document.getElementById(id);
      if (!targetElement) return noop;

      targetElement.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

      function cleanup() {
        window.removeEventListener('scroll', handleScroll);

        if (scrollTimeout.current !== undefined) {
          window.clearTimeout(scrollTimeout.current);
        }
      }

      function handleScroll() {
        if (scrollTimeout.current !== undefined) {
          window.clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = window.setTimeout(() => {
          if (window.location.pathname === location.pathname) {
            onDone?.();
            void navigate(`${location.pathname}#${id}`, { scroll: false });
          }

          cleanup();
        }, 50);
      }

      window.addEventListener('scroll', handleScroll);

      return cleanup;
    },
    [navigate, reduceMotion, location.pathname]
  );

  return scrollToHash;
}
