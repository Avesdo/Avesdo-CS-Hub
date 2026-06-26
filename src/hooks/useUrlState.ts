import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlState<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (val: T) => string;
    deserialize?: (val: string) => T;
    replace?: boolean;
  }
): [T, (val: T | ((prev: T) => T)) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const [state, setState] = useState<T>(() => {
    const param = searchParams.get(key);
    if (param !== null) {
      try {
        return options?.deserialize ? options.deserialize(param) : (param as unknown as T);
      } catch (e) {
        console.warn('Failed to parse URL param', key, e);
        return initialValue;
      }
    }
    return initialValue;
  });

  const setUrlState = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      setState((prev) => {
        const resolved = typeof newVal === 'function' ? (newVal as (prev: T) => T)(prev) : newVal;

        let isDefault =
          resolved === initialValue ||
          resolved === null ||
          resolved === undefined ||
          resolved === '';
        if (
          Array.isArray(resolved) &&
          resolved.length === 0 &&
          Array.isArray(initialValue) &&
          initialValue.length === 0
        ) {
          isDefault = true;
        }

        setSearchParams(
          (prevParams) => {
            const next = new URLSearchParams(prevParams);
            if (isDefault) {
              next.delete(key);
            } else {
              next.set(key, options?.serialize ? options.serialize(resolved) : String(resolved));
            }
            return next;
          },
          { replace: options?.replace ?? true }
        );

        return resolved;
      });
    },
    [key, setSearchParams, options, initialValue]
  );

  return [state, setUrlState];
}
