import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MutableRefObject,
  ReactNode,
} from 'react';
import { VisuallyHidden } from '~/components/visually-hidden';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cssProps } from '~/utils/style';
import styles from './segmented-control.module.css';

interface IndicatorStyle {
  left?: number;
  width?: number;
}

interface SegmentedControlContextValue {
  optionRefs: MutableRefObject<MutableRefObject<HTMLButtonElement | null>[]>;
  currentIndex: number;
  onChange: (index: number) => void;
  registerOption: (optionRef: MutableRefObject<HTMLButtonElement | null>) => void;
  unregisterOption: (optionRef: MutableRefObject<HTMLButtonElement | null>) => void;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

interface SegmentedControlProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  currentIndex: number;
  label: string;
  onChange: (index: number) => void;
}

export const SegmentedControl = ({
  children,
  currentIndex,
  onChange,
  label,
  ...props
}: SegmentedControlProps) => {
  const id = useId();
  const labelId = `${id}segmented-control-label`;
  const optionRefs = useRef<MutableRefObject<HTMLButtonElement | null>[]>([]);
  const [indicator, setIndicator] = useState<IndicatorStyle | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { length } = optionRefs.current;
      if (length === 0) return;

      const prevIndex = (currentIndex - 1 + length) % length;
      const nextIndex = (currentIndex + 1) % length;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        onChange(prevIndex);
        optionRefs.current[prevIndex]?.current?.focus?.();
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        onChange(nextIndex);
        optionRefs.current[nextIndex]?.current?.focus?.();
      }
    },
    [currentIndex, onChange]
  );

  const registerOption = useCallback(
    (optionRef: MutableRefObject<HTMLButtonElement | null>) => {
      if (!optionRefs.current.includes(optionRef)) {
        optionRefs.current = [...optionRefs.current, optionRef];
      }
    },
    []
  );

  const unregisterOption = useCallback(
    (optionRef: MutableRefObject<HTMLButtonElement | null>) => {
      optionRefs.current = optionRefs.current.filter(ref => ref !== optionRef);
    },
    []
  );

  useEffect(() => {
    const currentOption = optionRefs.current[currentIndex]?.current;

    if (!currentOption || typeof ResizeObserver === 'undefined') {
      setIndicator(null);
      return;
    }

    const updateIndicator = () => {
      const rect = currentOption.getBoundingClientRect();
      setIndicator({ width: rect.width, left: currentOption.offsetLeft });
    };

    updateIndicator();

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(currentOption);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentIndex]);

  const contextValue = useMemo(
    () => ({ optionRefs, currentIndex, onChange, registerOption, unregisterOption }),
    [currentIndex, onChange, registerOption, unregisterOption]
  );

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <div
        className={styles.container}
        role="radiogroup"
        tabIndex={0}
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <VisuallyHidden as="label" id={labelId}>
          {label}
        </VisuallyHidden>
        <div className={styles.options}>
          {indicator && (
            <div
              className={styles.indicator}
              data-last={currentIndex === optionRefs.current.length - 1}
              style={cssProps(indicator)}
            />
          )}
          {children}
        </div>
      </div>
    </SegmentedControlContext.Provider>
  );
};

interface SegmentedControlOptionProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
}

export const SegmentedControlOption = ({ children, ...props }: SegmentedControlOptionProps) => {
  const context = useContext(SegmentedControlContext);

  if (!context) {
    throw new Error('SegmentedControlOption must be used within a SegmentedControl');
  }

  const { optionRefs, currentIndex, onChange, registerOption, unregisterOption } = context;
  const optionRef = useRef<HTMLButtonElement | null>(null);
  const index = optionRefs.current.indexOf(optionRef);
  const isSelected = currentIndex === index;

  useEffect(() => {
    registerOption(optionRef);

    return () => {
      unregisterOption(optionRef);
    };
  }, [registerOption, unregisterOption]);

  return (
    <button
      className={styles.button}
      tabIndex={isSelected ? 0 : -1}
      role="radio"
      aria-checked={isSelected}
      onClick={() => {
        if (index >= 0) {
          onChange(index);
        }
      }}
      ref={optionRef}
      {...props}
    >
      {children}
    </button>
  );
};
