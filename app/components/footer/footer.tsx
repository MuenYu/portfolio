import type { HTMLAttributes } from 'react';
import { Text } from '~/components/text';
import { classes } from '~/utils/style';
import config from '~/config.json';
import styles from './footer.module.css';

type FooterProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> & {
  className?: string | null | false;
};

export const Footer = ({ className, ...rest }: FooterProps): JSX.Element => (
  <footer className={classes(styles['footer'], className)} {...rest}>
    <Text size="s" align="center">
      <span className={styles['date']}>
        {`© ${new Date().getFullYear()} ${config.name} | Hosted by Cloudflare`}
      </span>
    </Text>
  </footer>
);
