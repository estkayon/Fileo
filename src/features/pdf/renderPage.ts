import type { PDFDocumentProxy } from 'pdfjs-dist';

export type RenderTarget = { scale: number } | { width: number };

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  target: RenderTarget,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);

  try {
    const scale =
      'scale' in target ? target.scale : target.width / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvas, viewport }).promise;
    return canvas;
  } finally {
    page.cleanup();
  }
}
