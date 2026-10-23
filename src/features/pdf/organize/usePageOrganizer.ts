import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createPages,
  movePage,
  rotatePage,
  setPageThumbnail,
  togglePageDeleted,
  type PageEntry,
} from './pageModel';
import { renderThumbnails } from './renderThumbnails';

const PREVIEW_WARNING = 'Some page previews could not be loaded. You can still save the PDF.';

export type OrganizerState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'ready'; file: File; pages: PageEntry[]; warning: string }
  | { status: 'error'; message: string };

export function usePageOrganizer() {
  const [state, setState] = useState<OrganizerState>({ status: 'empty' });
  const currentLoad = useRef(0);
  const thumbnailUrls = useRef<string[]>([]);

  const releaseThumbnails = useCallback(() => {
    thumbnailUrls.current.forEach((url) => URL.revokeObjectURL(url));
    thumbnailUrls.current = [];
  }, []);

  useEffect(
    () => () => {
      currentLoad.current += 1;
      releaseThumbnails();
    },
    [releaseThumbnails],
  );

  const updatePages = useCallback((change: (pages: PageEntry[]) => PageEntry[]) => {
    setState((current) =>
      current.status === 'ready' ? { ...current, pages: change(current.pages) } : current,
    );
  }, []);

  const load = useCallback(
    async (file: File) => {
      currentLoad.current += 1;
      const loadId = currentLoad.current;
      const isCancelled = () => currentLoad.current !== loadId;

      releaseThumbnails();
      setState({ status: 'loading' });

      try {
        await renderThumbnails(file, {
          isCancelled,
          onPageCount: (count) => {
            if (isCancelled()) return;
            setState({ status: 'ready', file, pages: createPages(count), warning: '' });
          },
          onThumbnail: (pageIndex, thumbnail) => {
            if (isCancelled()) return;
            const url = URL.createObjectURL(thumbnail);
            thumbnailUrls.current.push(url);
            updatePages((pages) => setPageThumbnail(pages, pageIndex, url));
          },
        });
      } catch (error) {
        if (isCancelled()) return;
        const message = error instanceof Error ? error.message : 'Could not open this PDF.';
        setState((current) =>
          current.status === 'ready'
            ? { ...current, warning: PREVIEW_WARNING }
            : { status: 'error', message },
        );
      }
    },
    [releaseThumbnails, updatePages],
  );

  return {
    state,
    load,
    rotate: (sourceIndex: number, degrees: number) =>
      updatePages((pages) => rotatePage(pages, sourceIndex, degrees)),
    toggleDeleted: (sourceIndex: number) =>
      updatePages((pages) => togglePageDeleted(pages, sourceIndex)),
    move: (position: number, offset: number) =>
      updatePages((pages) => movePage(pages, position, offset)),
  };
}
