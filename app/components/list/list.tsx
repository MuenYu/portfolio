import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { classes } from '~/utils/style';
import styles from './list.module.css';

type UnorderedListProps = {
  ordered?: false;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'ul'>, 'children' | 'className'>;

type OrderedListProps = {
  ordered: true;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'ol'>, 'children' | 'className'>;

export type ListProps = OrderedListProps | UnorderedListProps;

export const List = (props: ListProps) => {
  const { ordered, children, className, ...rest } = props;

  if (ordered) {
    return (
      <ol className={classes(styles.list, className)} {...rest}>
        {children}
      </ol>
    );
  }

  return (
    <ul className={classes(styles.list, className)} {...rest}>
      {children}
    </ul>
  );
};

export type ListItemProps = ComponentPropsWithoutRef<'li'>;

export const ListItem = ({ children, ...rest }: ListItemProps) => {
  return (
    <li className={styles.item} {...rest}>
      {children}
    </li>
  );
};
