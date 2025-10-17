import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import { Text } from '~/components/text';
import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import type { ComponentPropsWithoutRef, JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './code.module.css';

type CodeProps = ComponentPropsWithoutRef<'pre'>;

export const Code = (props: CodeProps): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const elementRef = useRef<HTMLPreElement | null>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lang = props.className?.split('-')[1];

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (!elementRef.current) return;
    if (copyTimeout.current) {
      clearTimeout(copyTimeout.current);
    }
    void navigator.clipboard.writeText(elementRef.current.textContent ?? '');

    setCopied(true);

    copyTimeout.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, []);

  return (
    <div className={styles.code} data-theme={theme}>
      {!!lang && (
        <Text secondary size="s" className={styles.lang}>
          {lang}
        </Text>
      )}
      <pre ref={elementRef} {...props} />
      <div className={styles.actions}>
        <Button iconOnly onClick={handleCopy} aria-label="Copy">
          <span className={styles.copyIcon}>
            <Transition in={!copied}>
              {({ visible, nodeRef }) => (
                <Icon ref={nodeRef} icon="copy" data-visible={visible} />
              )}
            </Transition>
            <Transition in={copied}>
              {({ visible, nodeRef }) => (
                <Icon ref={nodeRef} icon="check" data-visible={visible} />
              )}
            </Transition>
          </span>
        </Button>
      </div>
    </div>
  );
};
