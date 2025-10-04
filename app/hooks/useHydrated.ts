import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => {};
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
