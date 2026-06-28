import { useSearchParams } from 'react-router-dom';

export function usePaginationParams(defaults: { size?: number } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(0, Number(searchParams.get('page') ?? 0));
  const size = Number(searchParams.get('size') ?? defaults.size ?? 10);

  const getParam = (key: string, fallback = '') => searchParams.get(key) ?? fallback;

  const setParams = (updates: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      let tocoFiltro = false;
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'page') tocoFiltro = true;
        if (value === null || value === '') next.delete(key);
        else next.set(key, String(value));
      }
      if (tocoFiltro && !('page' in updates)) next.set('page', '0');
      return next;
    });
  };

  const setPage = (p: number) => setParams({ page: p });
  const setSize = (s: number) => setParams({ size: s, page: 0 });

  return { page, size, getParam, setParams, setPage, setSize };
}
