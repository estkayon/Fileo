import { useCallback } from 'react';
import { useObjectUrls } from '../../useObjectUrls';
import { createAnnotationId, type ImageAsset } from './annotationModel';
import type { PreparedImage } from './imageAsset';

/**
 * Turns prepared images into assets with a preview URL. Placed images keep using their URL,
 * so all URLs are released together when the editor closes.
 */
export function useImageAssets() {
  const createUrl = useObjectUrls();

  return useCallback(
    (prepared: PreparedImage): ImageAsset => ({
      id: createAnnotationId(),
      url: createUrl(prepared.blob),
      ...prepared,
    }),
    [createUrl],
  );
}
