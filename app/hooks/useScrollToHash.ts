import { useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';
import { useCallback, useRef } from 'react';

export function useScrollToHash(): (hash: string, onDone?: () => void) => () => void {
  const scrollTimeout = useRef<number | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const scrollToHash = useCallback(
    (hash: string, onDone?: () => void) => {
      const id = hash.split('#')[1];
      if (!id) return;

      const targetElement = document.getElementById(id);
      if (!targetElement) return;

      targetElement.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

      const handleScroll = () => {
        if (scrollTimeout.current !== undefined) {
          clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = window.setTimeout(() => {
          window.removeEventListener('scroll', handleScroll);

          if (window.location.pathname === location.pathname) {
            onDone?.();
            void navigate(`${location.pathname}#${id}`, { scroll: false });
          }
        }, 50);
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeout.current !== undefined) {
          clearTimeout(scrollTimeout.current);
        }
      };
    },
    [navigate, reduceMotion, location.pathname]
  );

  return scrollToHash;
}
