import type { ComponentPropsWithoutRef, ElementType, ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';
import { classes } from '~/utils/style';
import styles from './heading.module.css';

type HeadingAlign = 'auto' | 'start' | 'center';
type HeadingWeight = 'regular' | 'medium' | 'bold';

type HeadingOwnProps<E extends ElementType> = {
  align?: HeadingAlign;
  as?: E;
  children?: ReactNode;
  className?: string;
  level?: 0 | 1 | 2 | 3 | 4 | 5;
  weight?: HeadingWeight;
};

export type HeadingProps<E extends ElementType = 'h1'> = HeadingOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof HeadingOwnProps<E>>;

export const Heading = <E extends ElementType = 'h1'>(
  {
    children,
    level = 1,
    as,
    align = 'auto',
    weight = 'medium',
    className,
    ...rest
  }: HeadingProps<E>
): ReactElement => {
  const clampedLevel = Math.min(Math.max(level, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5;
  const Component = (as ?? `h${Math.max(clampedLevel, 1)}`) as ElementType;

  return (
    <Fragment>
      <Component
        className={classes(styles.heading, className)}
        data-align={align}
        data-weight={weight}
        data-level={clampedLevel}
        {...rest}
      >
        {children}
      </Component>
    </Fragment>
  );
};
