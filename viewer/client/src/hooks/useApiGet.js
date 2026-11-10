import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';

/**
 * GET helper shared by every page. Handles loading / error state, cancels
 * in-flight requests on unmount or when the inputs change, and exposes reload().
 *
 *   const { data, loading, error, reload } = useApiGet('/buildings', { classification: 'Library' });
 */
export default function useApiGet(path, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    API.get(path, { params: JSON.parse(paramsKey), signal: controller.signal })
      .then((res) => setState({ data: res.data, loading: false, error: null }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(`GET ${path} failed:`, err);
        setState((s) => ({ ...s, loading: false, error: err }));
      });

    return () => controller.abort();
  }, [path, paramsKey, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { ...state, reload };
}
