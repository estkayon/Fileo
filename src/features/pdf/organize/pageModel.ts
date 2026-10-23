export interface PageEntry {
  /** Zero-based position of the page in the original PDF. */
  sourceIndex: number;
  /** Extra clockwise rotation in degrees: 0, 90, 180 or 270. */
  rotation: number;
  deleted: boolean;
  thumbnail: string | null;
}

export function normalizeRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function createPages(count: number): PageEntry[] {
  return Array.from({ length: count }, (_, sourceIndex) => ({
    sourceIndex,
    rotation: 0,
    deleted: false,
    thumbnail: null,
  }));
}

export function keptPages(pages: PageEntry[]): PageEntry[] {
  return pages.filter((page) => !page.deleted);
}

function updatePage(
  pages: PageEntry[],
  sourceIndex: number,
  change: (page: PageEntry) => PageEntry,
): PageEntry[] {
  return pages.map((page) => (page.sourceIndex === sourceIndex ? change(page) : page));
}

export function rotatePage(pages: PageEntry[], sourceIndex: number, degrees: number): PageEntry[] {
  return updatePage(pages, sourceIndex, (page) => ({
    ...page,
    rotation: normalizeRotation(page.rotation + degrees),
  }));
}

export function togglePageDeleted(pages: PageEntry[], sourceIndex: number): PageEntry[] {
  return updatePage(pages, sourceIndex, (page) => ({ ...page, deleted: !page.deleted }));
}

export function setPageThumbnail(
  pages: PageEntry[],
  sourceIndex: number,
  thumbnail: string,
): PageEntry[] {
  return updatePage(pages, sourceIndex, (page) => ({ ...page, thumbnail }));
}

export function movePage(pages: PageEntry[], position: number, offset: number): PageEntry[] {
  const target = position + offset;
  if (target < 0 || target >= pages.length) return pages;

  const next = [...pages];
  [next[position], next[target]] = [next[target], next[position]];
  return next;
}
