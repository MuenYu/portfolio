import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import styles from './nav-toggle.module.css';

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface NavToggleProps extends Omit<ButtonProps, 'iconOnly'> {
  menuOpen: boolean;
}

export const NavToggle = ({ menuOpen, ...rest }: NavToggleProps) => {
  return (
    <Button
      iconOnly
      className={styles.toggle}
      aria-label="Menu"
      aria-expanded={menuOpen}
      {...rest}
    >
      <div className={styles.inner}>
        <Icon className={styles.icon} data-menu={true} data-open={menuOpen} icon="menu" />
        <Icon
          className={styles.icon}
          data-close={true}
          data-open={menuOpen}
          icon="close"
        />
      </div>
    </Button>
  );
};
