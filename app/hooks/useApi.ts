import { useState, useCallback, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T,>(
  asyncFn: () => Promise<any>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFn();
      const data = response.data?.data || response.data;
      setState({ data, loading: false, error: null });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, [asyncFn]);

  useEffect(() => {
    execute();
  }, dependencies);

  return { ...state, refetch: execute };
};
