import { useNavigation } from 'react-router';
import { useRef, useEffect, useState } from 'react';
import styles from './progress.module.css';

export function Progress() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [visible, setVisible] = useState(false);
  const { state } = useNavigation();
  const progressRef = useRef<HTMLDivElement | null>(null);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
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
      if (timeout.current !== null) {
        window.clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, [state, animationComplete]);

  useEffect(() => {
    const element = progressRef.current;
    if (!element) return;

    const controller = new AbortController();

    if (state !== 'idle') {
      setAnimationComplete(false);
      return () => {
        controller.abort();
      };
    }

    const animations = element.getAnimations({ subtree: true });
    void Promise.all(animations.map(animation => animation.finished)).then(() => {
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
