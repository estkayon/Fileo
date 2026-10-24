import { PREVIEW_PAGE_LIMIT, usePdfPreview } from '../../features/preview/usePdfPreview';
import type { ConversionResult } from '../../types/converter';

export function PdfPreview(result: ConversionResult) {
  const state = usePdfPreview(result);

  if (state.status === 'loading') return <p role="status">Loading preview...</p>;
  if (state.status === 'error') return <p role="alert">{state.message}</p>;

  return (
    <>
      <ol className="preview__pages">
        {state.pages.map((url, index) => (
          <li key={url}>
            <img
              className="preview__page"
              src={url}
              alt={`Page ${index + 1} of ${result.fileName}`}
            />
          </li>
        ))}
      </ol>
      {state.totalPages > PREVIEW_PAGE_LIMIT && (
        <p className="preview__note">
          Showing the first {PREVIEW_PAGE_LIMIT} of {state.totalPages} pages.
        </p>
      )}
    </>
  );
}
