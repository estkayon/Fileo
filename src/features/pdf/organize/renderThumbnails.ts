import { canvasToBlob } from '../../image/imageUtils';
import { withPdf } from '../pdfjsUtils';
import { renderPageToCanvas } from '../renderPage';

const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_QUALITY = 0.8;
const MAX_PAGES = 200;

interface ThumbnailHandlers {
  onPageCount: (count: number) => void;
  onThumbnail: (pageIndex: number, thumbnail: Blob) => void;
  isCancelled: () => boolean;
}

export function renderThumbnails(
  file: File,
  { onPageCount, onThumbnail, isCancelled }: ThumbnailHandlers,
): Promise<void> {
  return withPdf(file, async (pdf) => {
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. The page organizer supports up to ${MAX_PAGES} pages.`,
      );
    }

    onPageCount(pdf.numPages);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (isCancelled()) return;
      const canvas = await renderPageToCanvas(pdf, pageNumber, { width: THUMBNAIL_WIDTH });
      onThumbnail(pageNumber - 1, await canvasToBlob(canvas, 'image/jpeg', THUMBNAIL_QUALITY));
    }
  });
}
