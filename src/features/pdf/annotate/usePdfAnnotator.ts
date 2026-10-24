import { useCallback, useEffect, useRef, useState } from 'react';
import { renderPageImages } from '../renderPageImages';
import {
  addAnnotation,
  DEFAULT_ASPECT_RATIO,
  removeAnnotation,
  removeLastAnnotation,
  type Annotation,
  type PageImage,
} from './annotationModel';

const PAGE_IMAGE_WIDTH = 1000;
const PAGE_IMAGE_QUALITY = 0.85;
const MAX_PAGES = 50;
const PREVIEW_WARNING = 'Some pages could not be shown. You can still save the PDF.';

export type AnnotatorState =
  | { status: 'empty' }
  | { status: 'loading' }
  | {
      status: 'ready';
      file: File;
      pages: PageImage[];
      annotations: Annotation[];
      warning: string;
    }
  | { status: 'error'; message: string };

export function usePdfAnnotator() {
  const [state, setState] = useState<AnnotatorState>({ status: 'empty' });
  const currentLoad = useRef(0);
  const imageUrls = useRef<string[]>([]);

  const releaseImages = useCallback(() => {
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrls.current = [];
  }, []);

  useEffect(
    () => () => {
      currentLoad.current += 1;
      releaseImages();
    },
    [releaseImages],
  );

  const updateReady = useCallback(
    (change: (ready: Extract<AnnotatorState, { status: 'ready' }>) => AnnotatorState) => {
      setState((current) => (current.status === 'ready' ? change(current) : current));
    },
    [],
  );

  const load = useCallback(
    async (file: File) => {
      currentLoad.current += 1;
      const loadId = currentLoad.current;
      const isCancelled = () => currentLoad.current !== loadId;

      releaseImages();
      setState({ status: 'loading' });

      try {
        await renderPageImages(
          file,
          {
            width: PAGE_IMAGE_WIDTH,
            quality: PAGE_IMAGE_QUALITY,
            maxPages: MAX_PAGES,
            toolName: 'PDF editor',
          },
          {
            isCancelled,
            onPageCount: (count) => {
              if (isCancelled()) return;
              setState({
                status: 'ready',
                file,
                pages: Array.from({ length: count }, () => ({
                  url: null,
                  aspectRatio: DEFAULT_ASPECT_RATIO,
                })),
                annotations: [],
                warning: '',
              });
            },
            onPage: (pageIndex, image, aspectRatio) => {
              if (isCancelled()) return;
              const url = URL.createObjectURL(image);
              imageUrls.current.push(url);
              updateReady((ready) => ({
                ...ready,
                pages: ready.pages.map((page, index) =>
                  index === pageIndex ? { url, aspectRatio } : page,
                ),
              }));
            },
          },
        );
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
    [releaseImages, updateReady],
  );

  return {
    state,
    load,
    add: (annotation: Annotation) =>
      updateReady((ready) => ({
        ...ready,
        annotations: addAnnotation(ready.annotations, annotation),
      })),
    remove: (id: string) =>
      updateReady((ready) => ({
        ...ready,
        annotations: removeAnnotation(ready.annotations, id),
      })),
    undo: () =>
      updateReady((ready) => ({
        ...ready,
        annotations: removeLastAnnotation(ready.annotations),
      })),
  };
}
