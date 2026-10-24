import { useCallback, useEffect, useRef } from 'react';
import { createAnnotationId, type ImageAsset } from './annotationModel';
import type { PreparedImage } from './imageAsset';

/**
 * Turns prepared images into assets with a preview URL. Placed images keep using their URL,
 * so all URLs are released together when the editor closes.
 */
export function useImageAssets() {
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current = [];
    },
    [],
  );

  return useCallback((prepared: PreparedImage): ImageAsset => {
    const url = URL.createObjectURL(prepared.blob);
    urls.current.push(url);
    return { id: createAnnotationId(), url, ...prepared };
  }, []);
}
