import { Text } from '~/components/text';
import { classes } from '~/utils/style';
import config from '~/config.json';
import styles from './footer.module.css';

type FooterProps = {
  className?: string;
};

export const Footer = ({ className }: FooterProps) => (
  <footer className={classes(styles.footer, className)}>
    <Text size="s" align="center">
      <span className={styles.date}>
        {`© ${new Date().getFullYear()} ${config.name} | Hosted by Cloudflare`}
      </span>
    </Text>
  </footer>
);
