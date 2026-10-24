import { canvasToBlob } from '../image/imageUtils';
import { withPdf } from './pdfjsUtils';
import { renderPageToCanvas } from './renderPage';

interface PageImageOptions {
  /** Width of every rendered image in pixels. */
  width: number;
  /** JPEG quality from 0 to 1. */
  quality: number;
  maxPages: number;
  /** Used in the "too many pages" message, e.g. "page organizer". */
  toolName: string;
}

interface PageImageHandlers {
  onPageCount: (count: number) => void;
  onPage: (pageIndex: number, image: Blob, aspectRatio: number) => void;
  isCancelled: () => boolean;
}

/** Renders every page to a JPEG one by one, so the caller can show pages as they arrive. */
export function renderPageImages(
  file: File,
  { width, quality, maxPages, toolName }: PageImageOptions,
  { onPageCount, onPage, isCancelled }: PageImageHandlers,
): Promise<void> {
  return withPdf(file, async (pdf) => {
    if (pdf.numPages > maxPages) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. The ${toolName} supports up to ${maxPages} pages.`,
      );
    }

    onPageCount(pdf.numPages);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (isCancelled()) return;
      const canvas = await renderPageToCanvas(pdf, pageNumber, { width });
      const image = await canvasToBlob(canvas, 'image/jpeg', quality);
      onPage(pageNumber - 1, image, canvas.width / canvas.height);
    }
  });
}
