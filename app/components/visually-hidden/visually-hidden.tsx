import type { ElementType, ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';
import { classes } from '~/utils/style';
import type { PolymorphicProps, PolymorphicRef } from '~/types/polymorphic';
import styles from './visually-hidden.module.css';

type VisuallyHiddenOwnProps = {
  className?: string;
  showOnFocus?: boolean;
  visible?: boolean;
  children?: ReactNode;
};

type VisuallyHiddenComponent = <E extends ElementType = 'span'>(
  props: PolymorphicProps<E, VisuallyHiddenOwnProps>
) => ReactElement | null;

const VisuallyHiddenBase = <E extends ElementType = 'span'>(
  {
    className,
    showOnFocus,
    as,
    children,
    visible,
    ...rest
  }: PolymorphicProps<E, VisuallyHiddenOwnProps>,
  ref: PolymorphicRef<E>
) => {
  const Component = (as ?? 'span') as ElementType;

  return (
    <Component
      className={classes(styles.hidden, className)}
      data-hidden={!visible && !showOnFocus}
      data-show-on-focus={showOnFocus}
      ref={ref}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const VisuallyHidden = forwardRef(VisuallyHiddenBase) as VisuallyHiddenComponent;
