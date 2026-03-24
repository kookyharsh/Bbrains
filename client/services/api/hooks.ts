import { useState, useCallback } from 'react';
import { ApiResponse } from './client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<ApiResponse<T>>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: () => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (): Promise<ApiResponse<T>> => {
    setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await apiFunction();

      if (response.success) {
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || 'An error occurred',
          success: false,
        });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      return { success: false, message: errorMessage };
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return { ...state, execute, reset };
}

export function useMutation<TData, TArgs extends unknown[]>(
  mutationFn: (...args: TArgs) => Promise<ApiResponse<TData>>
) {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(
    async (...args: TArgs): Promise<ApiResponse<TData>> => {
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      try {
        const response = await mutationFn(...args);

        if (response.success) {
          setState({
            data: response.data ?? null,
            loading: false,
            error: null,
            success: true,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || 'An error occurred',
            success: false,
          });
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });
        return { success: false, message: errorMessage };
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return { ...state, mutate, reset };
}

export function useQuery<T>(
  key: string[],
  queryFn: () => Promise<ApiResponse<T>>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
    success: false,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await queryFn();

      if (response.success) {
        setState({
          data: response.data ?? null,
          loading: false,
          error: null,
          success: true,
        });
        options?.onSuccess?.(response.data as T);
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || 'An error occurred',
          success: false,
        });
        options?.onError?.(response.message || 'An error occurred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      options?.onError?.(errorMessage);
    }
  }, [queryFn, options]);

  return { ...state, refetch };
}
