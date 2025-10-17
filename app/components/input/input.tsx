import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEvent,
  FocusEventHandler,
  FormEvent,
  FormEventHandler,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
} from 'react';
import { useId, useRef, useState } from 'react';
import { Icon } from '~/components/icon';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { classes, cssProps, msToNum } from '~/utils/style';
import { TextArea } from './text-area';
import styles from './input.module.css';

type FormFieldElement = HTMLInputElement | HTMLTextAreaElement;

export interface InputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onBlur' | 'onChange' | 'onInvalid'> {
  id?: string;
  label: ReactNode;
  value?: string;
  multiline?: boolean;
  error?: ReactNode;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  type?: string;
  name?: string;
  style?: CSSProperties;
  onBlur?: (event: FocusEvent<FormFieldElement>) => void;
  onChange?: (event: ChangeEvent<FormFieldElement>) => void;
  onInvalid?: (event: FormEvent<FormFieldElement>) => void;
}

export const Input = ({
  id,
  label,
  value,
  multiline,
  className,
  style,
  error,
  onBlur,
  autoComplete,
  required,
  maxLength,
  type,
  onChange,
  onInvalid,
  name,
  ...rest
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const inputId = id || `${generatedId}input`;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;

  const handleBlur = (event: FocusEvent<FormFieldElement>) => {
    setFocused(false);

    if (onBlur) {
      onBlur(event);
    }
  };

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = event => {
    handleBlur(event);
  };

  const handleTextAreaBlur: FocusEventHandler<HTMLTextAreaElement> = event => {
    handleBlur(event);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = event => {
    onChange?.(event);
  };

  const handleTextAreaChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    onChange?.(event);
  };

  const handleInputInvalid: FormEventHandler<HTMLInputElement> = event => {
    onInvalid?.(event);
  };

  const handleTextAreaInvalid: FormEventHandler<HTMLTextAreaElement> = event => {
    onInvalid?.(event);
  };

  return (
    <div
      className={classes(styles.container, className)}
      data-error={!!error}
      style={style}
      {...rest}
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
            className={styles.input}
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={error ? errorId : undefined}
            onFocus={() => setFocused(true)}
            onBlur={handleTextAreaBlur}
            value={value ?? ''}
            onChange={handleTextAreaChange}
            onInvalid={handleTextAreaInvalid}
            autoComplete={autoComplete}
            required={required}
            maxLength={maxLength}
            name={name}
          />
        ) : (
          <input
            className={styles.input}
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={error ? errorId : undefined}
            onFocus={() => setFocused(true)}
            onBlur={handleInputBlur}
            value={value}
            onChange={handleInputChange}
            onInvalid={handleInputInvalid}
            autoComplete={autoComplete}
            required={required}
            maxLength={maxLength}
            type={type}
            name={name}
          />
        )}
        <div className={styles.underline} data-focused={focused} />
      </div>
      <Transition unmount in={Boolean(error)} timeout={msToNum(tokens.base.durationM)}>
        {({ visible, nodeRef }) => {
          const errorNodeRef = nodeRef as MutableRefObject<HTMLDivElement | null>;

          return (
            <div
              ref={errorNodeRef}
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
          );
        }}
      </Transition>
    </div>
  );
};
