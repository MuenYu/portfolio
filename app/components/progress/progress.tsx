import { useNavigation } from 'react-router';
import type { JSX } from 'react';
import { useRef, useEffect, useState } from 'react';
import styles from './progress.module.css';

export function Progress(): JSX.Element {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [visible, setVisible] = useState(false);
  const { state } = useNavigation();
  const progressRef = useRef<HTMLDivElement | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (state !== 'idle') {
      timeout.current = window.setTimeout(() => {
        setVisible(true);
      }, 500);
    } else if (animationComplete) {
      timeout.current = window.setTimeout(() => {
        setVisible(false);
      }, 300);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [state, animationComplete]);

  useEffect(() => {
    const progressElement = progressRef.current;
    if (!progressElement) return;

    const controller = new AbortController();

    if (state !== 'idle') {
      setAnimationComplete(false);
      return () => {
        controller.abort();
      };
    }

    Promise.all(
      progressElement
        .getAnimations({ subtree: true })
        .map(animation => animation.finished)
    ).then(() => {
      if (controller.signal.aborted) return;
      setAnimationComplete(true);
    });

    return () => {
      controller.abort();
    };
  }, [state]);

  return (
    <div
      className={styles.progress}
      data-status={state}
      data-visible={visible}
      data-complete={animationComplete}
      ref={progressRef}
    />
  );
}
