import { useCallback, useEffect, useRef } from 'react';

/**
 * Creates object URLs for blobs and releases all of them when the component unmounts.
 * Call the returned function from event handlers or async code, not while rendering.
 */
export function useObjectUrls() {
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current = [];
    },
    [],
  );

  return useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    return url;
  }, []);
}
