import { renderPageImages } from '../renderPageImages';

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
  return renderPageImages(
    file,
    {
      width: THUMBNAIL_WIDTH,
      quality: THUMBNAIL_QUALITY,
      maxPages: MAX_PAGES,
      toolName: 'page organizer',
    },
    { onPageCount, onPage: onThumbnail, isCancelled },
  );
}
