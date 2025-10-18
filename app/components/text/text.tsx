import type { ElementType, ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';
import { classes } from '~/utils/style';
import type { PolymorphicProps, PolymorphicRef } from '~/types/polymorphic';
import styles from './text.module.css';

type TextSize = 's' | 'm' | 'l' | 'xl';
type TextAlign = 'auto' | 'start' | 'center';
type TextWeight = 'auto' | 'regular' | 'medium' | 'bold';

interface TextOwnProps {
  children?: ReactNode;
  size?: TextSize;
  align?: TextAlign;
  weight?: TextWeight;
  secondary?: boolean;
  className?: string;
}

type TextComponent = <E extends ElementType = 'span'>(
  props: PolymorphicProps<E, TextOwnProps>
) => ReactElement | null;

const TextBase = <E extends ElementType = 'span'>(
  {
    children,
    size = 'm',
    as,
    align = 'auto',
    weight = 'auto',
    secondary,
    className,
    ...rest
  }: PolymorphicProps<E, TextOwnProps>,
  ref: PolymorphicRef<E>
) => {
  const Component: ElementType = as ?? 'span';

  return (
    <Component
      ref={ref}
      className={classes(styles.text, className)}
      data-align={align}
      data-size={size}
      data-weight={weight}
      data-secondary={secondary}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const Text = forwardRef(TextBase) as TextComponent;
