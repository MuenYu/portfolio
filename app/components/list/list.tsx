import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { classes } from '~/utils/style';
import styles from './list.module.css';

type UnorderedListProps = {
  ordered?: false;
  children?: ReactNode;
  className?: string | undefined;
} & Omit<ComponentPropsWithoutRef<'ul'>, 'children' | 'className'>;

type OrderedListProps = {
  ordered: true;
  children?: ReactNode;
  className?: string | undefined;
} & Omit<ComponentPropsWithoutRef<'ol'>, 'children' | 'className'>;

type ListProps = UnorderedListProps | OrderedListProps;

export const List = ({
  ordered,
  children,
  className,
  ...rest
}: ListProps): JSX.Element => {
  const Element = ordered ? 'ol' : 'ul';

  return (
    <Element className={classes(styles['list'], className)} {...rest}>
      {children}
    </Element>
  );
};

type ListItemProps = ComponentPropsWithoutRef<'li'>;

export const ListItem = ({ children, ...rest }: ListItemProps): JSX.Element => {
  return (
    <li className={styles['item']} {...rest}>
      {children}
    </li>
  );
};
