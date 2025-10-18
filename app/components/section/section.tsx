import { forwardRef } from 'react';
import type { ElementType, ReactElement, ReactNode } from 'react';
import { classes } from '~/utils/style';
import type { PolymorphicProps, PolymorphicRef } from '~/types/polymorphic';
import styles from './section.module.css';

interface SectionOwnProps {
  className?: string;
  children?: ReactNode;
}

export type SectionProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  SectionOwnProps
>;

type SectionComponent = <E extends ElementType = 'div'>(
  props: SectionProps<E>
) => ReactElement | null;

const SectionInner = <E extends ElementType = 'div'>(
  { as, children, className, ...rest }: SectionProps<E>,
  ref: PolymorphicRef<E>
) => {
  const Component = as ?? 'div';

  return (
    <Component className={classes(styles['section'], className)} ref={ref} {...rest}>
      {children}
    </Component>
  );
};

export const Section = forwardRef(SectionInner) as SectionComponent;

Section.displayName = 'Section';
