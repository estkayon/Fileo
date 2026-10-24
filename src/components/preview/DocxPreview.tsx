import { useCallback } from 'react';
import { buildHtmlDocument } from '../../features/document/htmlDocument';
import { useLoad } from '../../features/preview/useLoad';
import type { ConversionResult } from '../../types/converter';
import { HtmlFrame } from './HtmlFrame';
import { LoadState } from './LoadState';

/** An approximate preview: the Word file is shown as a web page, without its page layout. */
export function DocxPreview({ blob, fileName }: ConversionResult) {
  const state = useLoad(
    useCallback(async () => {
      const mammoth = await import('mammoth');
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
      return buildHtmlDocument(fileName, value);
    }, [blob, fileName]),
  );

  return (
    <LoadState state={state}>
      {(html) => (
        <>
          <HtmlFrame html={html} title={`Preview of ${fileName}`} />
          <p className="preview__note">Approximate preview. Word shows the real page layout.</p>
        </>
      )}
    </LoadState>
  );
}
