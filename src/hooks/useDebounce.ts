import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Set up a timer to update debouncedValue after the specified delay
      const timerId = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cleanup: cancel the previous timer if the value changes before the delay
      return () => clearTimeout(timerId);
    },
    [value, delay]
  );

  return debouncedValue;
}