export function throttle<T extends (...args: never[]) => void>(
  func: T,
  timeFrame: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}
