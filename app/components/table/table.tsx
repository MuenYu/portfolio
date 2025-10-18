import type { PropsWithChildren } from 'react';
import styles from './table.module.css';

type TableElementProps<T extends keyof JSX.IntrinsicElements> = PropsWithChildren<
  JSX.IntrinsicElements[T]
>;

export const Table = ({ children, ...rest }: TableElementProps<'table'>) => (
  <table className={styles['table']} {...rest}>
    {children}
  </table>
);

export const TableRow = ({ children, ...rest }: TableElementProps<'tr'>) => (
  <tr className={styles['row']} {...rest}>
    {children}
  </tr>
);

export const TableHead = ({ children, ...rest }: TableElementProps<'thead'>) => (
  <thead className={styles['head']} {...rest}>
    {children}
  </thead>
);

export const TableBody = ({ children, ...rest }: TableElementProps<'tbody'>) => (
  <tbody className={styles['body']} {...rest}>
    {children}
  </tbody>
);

export const TableHeadCell = ({ children, ...rest }: TableElementProps<'th'>) => (
  <th className={styles['headCell']} {...rest}>
    {children}
  </th>
);

export const TableCell = ({ children, ...rest }: TableElementProps<'td'>) => (
  <td className={styles['cell']} {...rest}>
    {children}
  </td>
);
