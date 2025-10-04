import { AnimatePresence, usePresence } from 'framer-motion';
import type { MutableRefObject, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';

type TransitionTimeout = number | { enter: number; exit: number };

type TransitionRenderProps = {
  visible: boolean;
  status: TransitionStatus;
  nodeRef: MutableRefObject<HTMLElement | null>;
};

type TransitionSharedProps = {
  timeout?: TransitionTimeout;
  nodeRef?: MutableRefObject<HTMLElement | null>;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  initial?: boolean;
};

export type TransitionProps = TransitionSharedProps & {
  in?: boolean;
  unmount?: boolean;
  children: (props: TransitionRenderProps) => ReactNode;
};

/**
 * A lightweight Framer Motion `AnimatePresence` implementation of
 * `react-transition-group` to be used for simple vanilla css transitions.
 */
export const Transition = ({
  children,
  in: show = false,
  unmount,
  initial = true,
  timeout,
  nodeRef,
  onEnter,
  onEntered,
  onExit,
  onExited,
}: TransitionProps) => {
  const enterTimeout = useRef<number | undefined>(undefined);
  const exitTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (show) {
      if (exitTimeout.current !== undefined) {
        clearTimeout(exitTimeout.current);
      }
    } else if (enterTimeout.current !== undefined) {
      clearTimeout(enterTimeout.current);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {(show || !unmount) && (
        <TransitionContent
          enterTimeout={enterTimeout}
          exitTimeout={exitTimeout}
          in={show}
          initial={initial}
          timeout={timeout}
          nodeRef={nodeRef}
          onEnter={onEnter}
          onEntered={onEntered}
          onExit={onExit}
          onExited={onExited}
        >
          {children}
        </TransitionContent>
      )}
    </AnimatePresence>
  );
};

type TransitionContentProps = Required<Pick<TransitionProps, 'initial'>> &
  TransitionSharedProps & {
    children: TransitionProps['children'];
    enterTimeout: MutableRefObject<number | undefined>;
    exitTimeout: MutableRefObject<number | undefined>;
    in: boolean;
  };

const TransitionContent = ({
  children,
  timeout = 0,
  enterTimeout,
  exitTimeout,
  onEnter,
  onEntered,
  onExit,
  onExited,
  initial,
  nodeRef: defaultNodeRef,
  in: show,
}: TransitionContentProps) => {
  const [status, setStatus] = useState<TransitionStatus>(initial ? 'exited' : 'entered');
  const [isPresent, safeToRemove] = usePresence();
  const [hasEntered, setHasEntered] = useState(!initial);
  const splitTimeout = typeof timeout === 'object';
  const internalNodeRef = useRef<HTMLElement | null>(null);
  const nodeRef = defaultNodeRef || internalNodeRef;
  const visible = hasEntered && show ? isPresent : false;

  useEffect(() => {
    if (hasEntered || !show) return;

    const actualTimeout = splitTimeout ? timeout.enter : timeout;

    if (enterTimeout.current !== undefined) {
      clearTimeout(enterTimeout.current);
    }
    if (exitTimeout.current !== undefined) {
      clearTimeout(exitTimeout.current);
    }

    setHasEntered(true);
    setStatus('entering');
    onEnter?.();

    // Force reflow
    nodeRef.current?.offsetHeight;

    const delay = typeof actualTimeout === 'number' ? actualTimeout : 0;

    enterTimeout.current = window.setTimeout(() => {
      setStatus('entered');
      onEntered?.();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEnter, onEntered, timeout, status, show]);

  useEffect(() => {
    if (isPresent && show) return;

    const actualTimeout = splitTimeout ? timeout.exit : timeout;

    if (enterTimeout.current !== undefined) {
      clearTimeout(enterTimeout.current);
    }
    if (exitTimeout.current !== undefined) {
      clearTimeout(exitTimeout.current);
    }

    setStatus('exiting');
    onExit?.();

    // Force reflow
    nodeRef.current?.offsetHeight;

    const delay = typeof actualTimeout === 'number' ? actualTimeout : 0;

    exitTimeout.current = window.setTimeout(() => {
      setStatus('exited');
      safeToRemove?.();
      onExited?.();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent, onExit, safeToRemove, timeout, onExited, show]);

  return children({ visible, status, nodeRef });
};
