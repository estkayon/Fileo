import { useCallback } from 'react';
import { useLoad } from '../../features/preview/useLoad';
import { useObjectUrls } from '../../features/useObjectUrls';
import type { ConversionResult } from '../../types/converter';
import { LoadState } from './LoadState';

export function ImagePreview({ blob, fileName }: ConversionResult) {
  const createUrl = useObjectUrls();
  const state = useLoad(useCallback(async () => createUrl(blob), [blob, createUrl]));

  return (
    <LoadState state={state}>
      {(url) => <img className="preview__image" src={url} alt={`Preview of ${fileName}`} />}
    </LoadState>
  );
}
