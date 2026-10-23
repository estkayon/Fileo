import { htmlToPdf, isHtmlBlob } from '../features/document/htmlToPdf';
import type { ConversionItem } from '../features/runJob';
import { downloadResult } from '../lib/download';
import { buildFileName } from '../lib/fileName';
import { formatBytes } from '../lib/formatBytes';
import { zipResults } from '../lib/zip';
import type { ConversionResult } from '../types/converter';
import { AsyncDownloadButton } from './AsyncDownloadButton';

const ARCHIVE_NAME = 'fileo-converted.zip';

interface ResultRowProps {
  sourceSize: number;
  result: ConversionResult;
}

function ResultRow({ sourceSize, result }: ResultRowProps) {
  const isHtml = isHtmlBlob(result.blob);

  return (
    <>
      <div className="result__info">
        <span className="result__name">{result.fileName}</span>
        <span className="result__meta">
          {formatBytes(sourceSize)} → {formatBytes(result.blob.size)}
        </span>
      </div>
      <div className="result__actions">
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
    </>
  );
}

interface ResultListProps {
  items: ConversionItem[];
}

export function ResultList({ items }: ResultListProps) {
  const results = items.flatMap((item) => (item.status === 'done' ? [item.result] : []));

  return (
    <>
      {items.length > 1 && (
        <p>
          {results.length} of {items.length} files converted.
        </p>
      )}

      <ul className="results">
        {items.map((item, index) => (
          <li key={`${index}-${item.name}`} className="result">
            {item.status === 'done' ? (
              <ResultRow sourceSize={item.sourceSize} result={item.result} />
            ) : (
              <div className="result__info">
                <span className="result__name">{item.name}</span>
                <span role="alert">{item.message}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

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
