import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
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
  useRef,
  useState,
} from 'react';
import { cssProps } from '~/utils/style';
import styles from './segmented-control.module.css';

type IndicatorStyle = {
  left?: number;
  width?: number;
};

type OptionRef = MutableRefObject<HTMLButtonElement | null>;

interface SegmentedControlContextValue {
  currentIndex: number;
  onChange: (index: number) => void;
  optionRefs: MutableRefObject<OptionRef[]>;
  registerOption: (optionRef: OptionRef) => void;
  unregisterOption: (optionRef: OptionRef) => void;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

const useSegmentedControlContext = (): SegmentedControlContextValue => {
  const context = useContext(SegmentedControlContext);

  if (!context) {
    throw new Error('SegmentedControl components must be used within SegmentedControl');
  }

  return context;
};

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  children: ReactNode;
  currentIndex: number;
  label: ReactNode;
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
  const optionRefs = useRef<OptionRef[]>([]);
  const [indicator, setIndicator] = useState<IndicatorStyle>();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { length } = optionRefs.current;
    if (length === 0) {
      return;
    }

    const prevIndex = (currentIndex - 1 + length) % length;
    const nextIndex = (currentIndex + 1) % length;

    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      onChange(prevIndex);
      optionRefs.current[prevIndex]?.current?.focus();
    } else if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      onChange(nextIndex);
      optionRefs.current[nextIndex]?.current?.focus();
    }
  };

  const registerOption = useCallback((optionRef: OptionRef) => {
    if (!optionRefs.current.includes(optionRef)) {
      optionRefs.current = [...optionRefs.current, optionRef];
    }
  }, []);

  const unregisterOption = useCallback((optionRef: OptionRef) => {
    optionRefs.current = optionRefs.current.filter(ref => ref !== optionRef);
  }, []);

  useEffect(() => {
    const currentOption = optionRefs.current[currentIndex]?.current;

    if (!currentOption) {
      return;
    }

    const updateIndicator = () => {
      const rect = currentOption.getBoundingClientRect();
      setIndicator({ width: rect.width, left: currentOption.offsetLeft });
    };

    updateIndicator();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(currentOption);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentIndex]);

  return (
    <SegmentedControlContext.Provider
      value={{ optionRefs, currentIndex, onChange, registerOption, unregisterOption }}
    >
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
          {!!indicator && (
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

export interface SegmentedControlOptionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const SegmentedControlOption = ({
  children,
  ...props
}: SegmentedControlOptionProps) => {
  const { optionRefs, currentIndex, onChange, registerOption, unregisterOption } =
    useSegmentedControlContext();
  const optionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    registerOption(optionRef);

    return () => {
      unregisterOption(optionRef);
    };
  }, [registerOption, unregisterOption]);

  const index = optionRefs.current.indexOf(optionRef);
  const isSelected = currentIndex === index;

  const handleClick = () => {
    if (index !== -1) {
      onChange(index);
    }
  };

  return (
    <button
      className={styles.button}
      tabIndex={isSelected ? 0 : -1}
      role="radio"
      aria-checked={isSelected}
      type="button"
      onClick={handleClick}
      ref={optionRef}
      {...props}
    >
      {children}
    </button>
  );
};
