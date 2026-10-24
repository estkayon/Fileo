import type { ReactNode } from 'react';
import type { Loadable } from '../../features/preview/useLoad';

interface LoadStateProps<T> {
  state: Loadable<T>;
  children: (value: T) => ReactNode;
}

/** Shows a loading or error message until the preview data is ready. */
export function LoadState<T>({ state, children }: LoadStateProps<T>) {
  if (state.status === 'loading') return <p role="status">Loading preview...</p>;
  if (state.status === 'error') return <p role="alert">{state.message}</p>;
  return <>{children(state.value)}</>;
}
