import { useState } from 'react';
import { htmlToPdf, isHtmlBlob } from '../features/document/htmlToPdf';
import { getPreviewKind } from '../features/preview/previewKind';
import type { ConversionItem } from '../features/runJob';
import { downloadResult } from '../lib/download';
import { buildFileName } from '../lib/fileName';
import { formatBytes } from '../lib/formatBytes';
import { zipResults } from '../lib/zip';
import type { ConversionResult } from '../types/converter';
import { AsyncDownloadButton } from './AsyncDownloadButton';
import { ResultPreview } from './ResultPreview';

const ARCHIVE_NAME = 'fileo-converted.zip';

function DownloadButtons({ result }: { result: ConversionResult }) {
  const isHtml = isHtmlBlob(result.blob);

  return (
    <div className="output__actions">
      <button type="button" className="action" onClick={() => downloadResult(result)}>
        {isHtml ? 'Download HTML' : 'Download'}
      </button>
      {isHtml && (
        <AsyncDownloadButton
          label="Download PDF"
          busyLabel="Creating PDF..."
          createFile={async (onProgress) => ({
            blob: await htmlToPdf(result.blob, onProgress),
            fileName: buildFileName(result.fileName, 'pdf'),
          })}
        />
      )}
    </div>
  );
}

function SelectedItem({ item }: { item: ConversionItem }) {
  if (item.status === 'error') {
    return (
      <div className="output__item">
        <span className="output__name">{item.name}</span>
        <p role="alert">{item.message}</p>
      </div>
    );
  }

  const { result } = item;
  return (
    <div className="output__item">
      <div className="output__header">
        <span className="output__name">{result.fileName}</span>
        <span className="output__meta">
          {formatBytes(item.sourceSize)} → {formatBytes(result.blob.size)}
        </span>
      </div>
      <div className="preview">
        {getPreviewKind(result) ? (
          <ResultPreview result={result} />
        ) : (
          <p>There is no preview for this file type.</p>
        )}
      </div>
      <DownloadButtons result={result} />
    </div>
  );
}

interface ConversionOutputProps {
  items: ConversionItem[];
}

export function ConversionOutput({ items }: ConversionOutputProps) {
  // The selection belongs to one set of results. A new conversion starts again at the first file.
  const [selection, setSelection] = useState({ items, index: 0 });
  const selectedIndex = selection.items === items ? selection.index : 0;
  const results = items.flatMap((item) => (item.status === 'done' ? [item.result] : []));

  return (
    <>
      {items.length > 1 && (
        <>
          <p className="output__summary">
            {results.length} of {items.length} files converted. Choose a file to preview it.
          </p>
          <div className="output__files" role="group" aria-label="Converted files">
            {items.map((item, index) => (
              <button
                key={`${index}-${item.name}`}
                type="button"
                className={`tool${index === selectedIndex ? ' tool--active' : ''}${
                  item.status === 'error' ? ' tool--failed' : ''
                }`}
                aria-pressed={index === selectedIndex}
                onClick={() => setSelection({ items, index })}
              >
                {item.status === 'done' ? item.result.fileName : item.name}
              </button>
            ))}
          </div>
        </>
      )}

      <SelectedItem key={selectedIndex} item={items[selectedIndex]} />

      {results.length > 1 && (
        <AsyncDownloadButton
          label="Download all (ZIP)"
          busyLabel="Zipping..."
          createFile={async () => ({ blob: await zipResults(results), fileName: ARCHIVE_NAME })}
        />
      )}
    </>
  );
}
