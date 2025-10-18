import type { CSSProperties, HTMLAttributes } from 'react';
import { classes, cssProps, numToMs } from '~/utils/style';
import styles from './divider.module.css';

type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  lineWidth?: string | number;
  lineHeight?: string | number;
  notchWidth?: string | number;
  notchHeight?: string | number;
  collapseDelay?: number;
  collapsed?: boolean;
  className?: string | null | false | undefined;
  style?: CSSProperties;
};

export const Divider = ({
  lineWidth = '100%',
  lineHeight = '2px',
  notchWidth = '90px',
  notchHeight = '10px',
  collapseDelay = 0,
  collapsed = false,
  className,
  style,
  ...rest
}: DividerProps): JSX.Element => (
  <div
    className={classes(styles['divider'], className)}
    style={cssProps(
      {
        lineWidth,
        lineHeight,
        notchWidth,
        notchHeight,
        collapseDelay: numToMs(collapseDelay),
      },
      style
    )}
    {...rest}
  >
    <div className={styles['line']} data-collapsed={collapsed} />
    <div
      className={styles['notch']}
      data-collapsed={collapsed}
      style={cssProps({ collapseDelay: numToMs(collapseDelay + 160) })}
    />
  </div>
);
