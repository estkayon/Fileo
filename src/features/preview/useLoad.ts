import { useEffect, useState } from 'react';

export type Loadable<T> =
  { status: 'loading' } | { status: 'ready'; value: T } | { status: 'error'; message: string };

/** Runs an async loader when the component mounts. The loader must be memoized with useCallback. */
export function useLoad<T>(load: () => Promise<T>): Loadable<T> {
  const [state, setState] = useState<Loadable<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    load().then(
      (value) => {
        if (!cancelled) setState({ status: 'ready', value });
      },
      () => {
        if (!cancelled) setState({ status: 'error', message: 'Preview is not available.' });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}
