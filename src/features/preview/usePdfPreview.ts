import { useEffect, useState } from 'react';
import type { ConversionResult } from '../../types/converter';
import { renderPageImages } from '../pdf/renderPageImages';
import { useObjectUrls } from '../useObjectUrls';

export const PREVIEW_PAGE_LIMIT = 5;
const PREVIEW_WIDTH = 720;
const PREVIEW_QUALITY = 0.85;

export type PdfPreviewState =
  | { status: 'loading' }
  | { status: 'ready'; pages: string[]; totalPages: number }
  | { status: 'error'; message: string };

/** Renders the first pages of a PDF result, showing each one as soon as it is ready. */
export function usePdfPreview({ blob, fileName }: ConversionResult): PdfPreviewState {
  const createUrl = useObjectUrls();
  const [state, setState] = useState<PdfPreviewState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let rendered = 0;

    renderPageImages(
      new File([blob], fileName, { type: blob.type }),
      {
        width: PREVIEW_WIDTH,
        quality: PREVIEW_QUALITY,
        maxPages: Number.POSITIVE_INFINITY,
        toolName: 'preview',
      },
      {
        isCancelled: () => cancelled || rendered >= PREVIEW_PAGE_LIMIT,
        onPageCount: (totalPages) => {
          if (!cancelled) setState({ status: 'ready', pages: [], totalPages });
        },
        onPage: (_pageIndex, image) => {
          rendered += 1;
          if (cancelled) return;
          const url = createUrl(image);
          setState((current) =>
            current.status === 'ready' ? { ...current, pages: [...current.pages, url] } : current,
          );
        },
      },
    ).catch(() => {
      if (!cancelled) setState({ status: 'error', message: 'Preview is not available.' });
    });

    return () => {
      cancelled = true;
    };
  }, [blob, fileName, createUrl]);

  return state;
}
