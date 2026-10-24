import { useCallback } from 'react';
import { useLoad } from '../../features/preview/useLoad';
import type { ConversionResult } from '../../types/converter';
import { LoadState } from './LoadState';

const MAX_CHARACTERS = 5000;

export function TextPreview({ blob }: ConversionResult) {
  const state = useLoad(useCallback(() => blob.text(), [blob]));

  return (
    <LoadState state={state}>
      {(text) => (
        <>
          <pre className="preview__text">{text.slice(0, MAX_CHARACTERS)}</pre>
          {text.length > MAX_CHARACTERS && (
            <p className="preview__note">Showing the first {MAX_CHARACTERS} characters.</p>
          )}
        </>
      )}
    </LoadState>
  );
}
