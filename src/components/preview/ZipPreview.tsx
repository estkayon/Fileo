import { useCallback } from 'react';
import { readZipEntries } from '../../features/preview/readZipEntries';
import { useLoad } from '../../features/preview/useLoad';
import { useObjectUrls } from '../../features/useObjectUrls';
import type { ConversionResult } from '../../types/converter';
import { LoadState } from './LoadState';

export function ZipPreview({ blob }: ConversionResult) {
  const createUrl = useObjectUrls();
  const state = useLoad(
    useCallback(async () => {
      const { entries, totalFiles } = await readZipEntries(blob);
      return {
        totalFiles,
        files: entries.map(({ name, image }) => ({
          name,
          url: image ? createUrl(image) : null,
        })),
      };
    }, [blob, createUrl]),
  );

  return (
    <LoadState state={state}>
      {({ files, totalFiles }) => (
        <>
          <ul className="preview__files">
            {files.map(({ name, url }) => (
              <li key={name}>
                {url && <img className="preview__thumbnail" src={url} alt="" />}
                <span className="preview__file-name">{name}</span>
              </li>
            ))}
          </ul>
          {totalFiles > files.length && (
            <p className="preview__note">
              Showing {files.length} of {totalFiles} files.
            </p>
          )}
        </>
      )}
    </LoadState>
  );
}
