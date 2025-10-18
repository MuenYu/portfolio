import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useRef, useState } from 'react';
import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import { Text } from '~/components/text';
import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import styles from './code.module.css';

type CodeProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;

export const Code = (props: CodeProps) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const elementRef = useRef<HTMLPreElement | null>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { className, ...preProps } = props;
  const lang = className?.split('-')[1];

  const handleCopy = () => {
    if (copyTimeout.current !== null) {
      window.clearTimeout(copyTimeout.current);
    }

    const textToCopy = elementRef.current?.textContent ?? '';
    void navigator.clipboard.writeText(textToCopy);

    setCopied(true);

    copyTimeout.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={styles.code} data-theme={theme}>
      {!!lang && (
        <Text secondary size="s" className={styles.lang}>
          {lang}
        </Text>
      )}
      <pre ref={elementRef} className={className} {...preProps} />
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
