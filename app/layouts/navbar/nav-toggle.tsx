import { Button, type ButtonProps } from '~/components/button';
import { Icon } from '~/components/icon';
import styles from './nav-toggle.module.css';

type NavToggleProps = ButtonProps<'button'> & {
  menuOpen: boolean;
};

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
