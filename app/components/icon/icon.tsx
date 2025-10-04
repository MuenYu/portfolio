import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';
import { classes } from '~/utils/style';
import styles from './icon.module.css';
import sprites from './icons.svg';

type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'> & {
  icon: string;
  size?: number;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, size = 24, ...rest }, ref) => {
    return (
      <svg
        aria-hidden
        ref={ref}
        className={classes(styles.icon, className)}
        width={size}
        height={size}
        {...rest}
      >
        <use href={`${sprites}#${icon}`} />
      </svg>
    );
  }
);
