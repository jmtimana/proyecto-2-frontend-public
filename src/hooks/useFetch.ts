import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { parseError } from '../utils/errorHandler';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {

        if (axios.isCancel(err) || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        const parsed = parseError(err);
        setError(parsed.userMessage);
        setLoading(false);
      });

    return () => controller.abort();

  }, [...deps, nonce]);

  return { data, loading, error, reload };
}
