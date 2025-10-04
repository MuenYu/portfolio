import type { ComponentPropsWithRef, ElementType } from 'react';

export type PolymorphicProps<E extends ElementType, P> = P &
  Omit<ComponentPropsWithRef<E>, keyof P | 'as'> & {
    as?: E;
  };

export type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>['ref'];
