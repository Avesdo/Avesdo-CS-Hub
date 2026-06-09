import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface AsyncActionState<T> {
  isSubmitting: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsyncAction<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (err: Error) => void
) {
  const [state, setState] = useState<AsyncActionState<T>>({
    isSubmitting: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
      try {
        const result = await asyncFn(...args);
        setState({ isSubmitting: false, error: null, data: result });
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err: any) {
        setState({ isSubmitting: false, error: err, data: null });
        if (onError) onError(err);
        return null;
      }
    },
    [asyncFn, onSuccess, onError]
  );

  return {
    ...state,
    execute,
  };
}
