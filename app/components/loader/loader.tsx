import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Text } from '~/components/text';
import { classes, cssProps } from '~/utils/style';
import styles from './loader.module.css';

type LoaderBaseProps = {
  center?: boolean;
  height?: number;
  size?: number;
  text?: string;
  width?: number;
};

export type LoaderProps = LoaderBaseProps & Omit<ComponentPropsWithoutRef<'div'>, keyof LoaderBaseProps>;

export const Loader = forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, style, width = 32, height = 4, size, text = 'Loading...', center, ...rest }, ref) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
      return (
        <Text className={classes(styles.text, className)} weight="medium" {...rest}>
          {text}
        </Text>
      );
    }

    const normalizedStyle = (style ?? {}) as Record<string, string | number | undefined>;
    const loaderWidth = size ?? width;

    return (
      <div
        ref={ref}
        className={classes(styles.loader, className)}
        data-center={center}
        style={cssProps({ width: loaderWidth, height }, normalizedStyle)}
        {...rest}
      >
        <div className={styles.span} />
      </div>
    );
  }
);
