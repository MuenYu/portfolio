import type { ElementType, ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';
import type { PolymorphicProps, PolymorphicRef } from '~/types/polymorphic';
import { classes } from '~/utils/style';
import styles from './section.module.css';

type SectionOwnProps = {
  children?: ReactNode;
  className?: string;
};

export type SectionProps<E extends ElementType = 'div'> = PolymorphicProps<E, SectionOwnProps>;

type SectionComponent = <E extends ElementType = 'div'>(
  props: SectionProps<E>
) => ReactElement | null;

const SectionBase = <E extends ElementType = 'div'>(
  { as, children, className, ...rest }: SectionProps<E>,
  ref: PolymorphicRef<E>
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component className={classes(styles.section, className)} ref={ref} {...rest}>
      {children}
    </Component>
  );
};

export const Section = forwardRef(SectionBase) as SectionComponent;
