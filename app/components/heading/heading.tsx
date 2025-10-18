import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { classes } from '~/utils/style';
import styles from './heading.module.css';

type HeadingAlign = 'auto' | 'start' | 'center' | 'end';
type HeadingWeight = 'regular' | 'medium' | 'bold';

type HeadingProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> & {
  children: ReactNode;
  level?: number;
  as?: keyof JSX.IntrinsicElements;
  align?: HeadingAlign;
  weight?: HeadingWeight;
  className?: string | null | false;
};

export const Heading = ({
  children,
  level = 1,
  as,
  align = 'auto',
  weight = 'medium',
  className,
  ...rest
}: HeadingProps): JSX.Element => {
  const clampedLevel = Math.min(Math.max(level, 0), 5);
  const Component = as ?? `h${Math.max(clampedLevel, 1)}`;

  return (
    <Fragment>
      <Component
        className={classes(styles['heading'], className)}
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
