import {
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
  useRef,
  useState,
} from 'react';
import { Icon } from '~/components/icon';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { classes, cssProps, msToNum } from '~/utils/style';
import { TextArea } from './text-area';
import styles from './input.module.css';

interface BaseInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onBlur'> {
  error?: string;
  label: string;
  multiline?: boolean;
}

type NativeInputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
    multiline?: false;
  };

type NativeTextAreaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
    multiline: true;
    resize?: CSSProperties['resize'];
  };

type InputProps = NativeInputProps | NativeTextAreaProps;

type BlurEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement>;

export const Input = ({
  id,
  label,
  value,
  multiline,
  className,
  style,
  error,
  onBlur,
  ...rest
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const inputId = id ?? `${generatedId}input`;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;
  const handleBlur = (event: BlurEvent) => {
    setFocused(false);

    if (onBlur) {
      onBlur(event);
    }
  };

  const sharedInputProps = {
    className: styles.input,
    id: inputId,
    'aria-labelledby': labelId,
    'aria-describedby': error ? errorId : undefined,
    onFocus: () => setFocused(true),
    onBlur: handleBlur,
    value,
  } as const;

  const containerAttributes: Record<string, unknown> = {};
  const inputAttributes: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (
      key.startsWith('data-') ||
      key.startsWith('aria-') ||
      key === 'role' ||
      key === 'tabIndex' ||
      key === 'title'
    ) {
      containerAttributes[key] = value;
      continue;
    }

    if (
      key.startsWith('on') &&
      key !== 'onChange' &&
      key !== 'onInput' &&
      key !== 'onInvalid' &&
      key !== 'onFocus' &&
      key !== 'onBlur' &&
      key !== 'onKeyDown' &&
      key !== 'onKeyUp' &&
      key !== 'onKeyPress'
    ) {
      containerAttributes[key] = value;
      continue;
    }

    inputAttributes[key] = value;
  }

  const containerProps = containerAttributes as Omit<
    HTMLAttributes<HTMLDivElement>,
    'children'
  >;

  return (
    <div
      className={classes(styles.container, className)}
      data-error={!!error}
      style={style}
      {...containerProps}
    >
      <div className={styles.content}>
        <label
          className={styles.label}
          data-focused={focused}
          data-filled={!!value}
          id={labelId}
          htmlFor={inputId}
        >
          {label}
        </label>
        {multiline ? (
          <TextArea
            {...sharedInputProps}
            {...(inputAttributes as Omit<
              NativeTextAreaProps,
              keyof BaseInputProps | 'multiline'
            >)}
          />
        ) : (
          <input
            {...sharedInputProps}
            {...(inputAttributes as Omit<
              NativeInputProps,
              keyof BaseInputProps | 'multiline'
            >)}
          />
        )}
        <div className={styles.underline} data-focused={focused} />
      </div>
      <Transition unmount in={error} timeout={msToNum(tokens.base.durationM)}>
        {({ visible, nodeRef }) => (
          <div
            ref={nodeRef}
            className={styles.error}
            data-visible={visible}
            id={errorId}
            role="alert"
            style={cssProps({
              height: visible ? errorRef.current?.getBoundingClientRect().height : 0,
            })}
          >
            <div className={styles.errorMessage} ref={errorRef}>
              <Icon icon="error" />
              {error}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};
