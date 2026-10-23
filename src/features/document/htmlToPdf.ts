import { canvasToBlob } from '../image/imageUtils';
import { createPdf, savePdf } from '../pdf/pdfUtils';

const PX_TO_PT = 72 / 96;
const PAGE_WIDTH_PT = 595.28;
const PAGE_HEIGHT_PT = 841.89;
const MARGIN_PT = 40;
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - 2 * MARGIN_PT;
const CONTENT_HEIGHT_PT = PAGE_HEIGHT_PT - 2 * MARGIN_PT;

const RENDER_WIDTH_PX = Math.round(CONTENT_WIDTH_PT / PX_TO_PT);
const PAGE_HEIGHT_PX = Math.floor(CONTENT_HEIGHT_PT / PX_TO_PT);
const CANVAS_SCALE = 2;
const MAX_PAGES = 50;
const BREAK_SEARCH_RATIO = 0.15;
const BLANK_THRESHOLD = 250;

export function isHtmlBlob(blob: Blob): boolean {
  return blob.type.startsWith('text/html');
}

function loadFrame(frame: HTMLIFrameElement, url: string): Promise<void> {
  return new Promise((resolve) => {
    frame.addEventListener('load', () => resolve(), { once: true });
    frame.src = url;
    document.body.append(frame);
  });
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');
  return context;
}

function isBlankRow(context: CanvasRenderingContext2D, row: number, width: number): boolean {
  const { data } = context.getImageData(0, row, width, 1);
  for (let index = 0; index < data.length; index += 4) {
    const isDark =
      data[index] < BLANK_THRESHOLD ||
      data[index + 1] < BLANK_THRESHOLD ||
      data[index + 2] < BLANK_THRESHOLD;
    if (isDark) return false;
  }
  return true;
}

// Cuts the page at an empty row near the bottom so text lines are not sliced in half.
function findCutRow(canvas: HTMLCanvasElement): number {
  const context = getContext(canvas);
  const lowestRow = Math.floor(canvas.height * (1 - BREAK_SEARCH_RATIO));

  for (let row = canvas.height; row > lowestRow; row -= 1) {
    if (isBlankRow(context, row - 1, canvas.width)) return row;
  }
  return canvas.height;
}

async function cropToPng(source: HTMLCanvasElement, height: number): Promise<ArrayBuffer> {
  const cropped = document.createElement('canvas');
  cropped.width = source.width;
  cropped.height = height;
  getContext(cropped).drawImage(source, 0, 0);

  const blob = await canvasToBlob(cropped, 'image/png', 1);
  return blob.arrayBuffer();
}

export async function htmlToPdf(html: Blob, onProgress: (fraction: number) => void): Promise<Blob> {
  const [{ default: html2canvas }, pdf] = await Promise.all([
    import('html2canvas-pro'),
    createPdf(),
  ]);

  const url = URL.createObjectURL(html);
  const frame = document.createElement('iframe');
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${RENDER_WIDTH_PX}px;height:${PAGE_HEIGHT_PX}px;border:0;`;

  try {
    await loadFrame(frame, url);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('Could not render the document.');

    const { body, documentElement } = frameDocument;
    body.style.cssText = 'margin:0;padding:0;max-width:none;';

    const totalHeight = documentElement.scrollHeight;
    if (totalHeight > PAGE_HEIGHT_PX * MAX_PAGES) {
      throw new Error(`This document is longer than ${MAX_PAGES} pages.`);
    }

    // One page at a time keeps each canvas small enough for phone browsers.
    let offset = 0;
    while (offset < totalHeight) {
      const bandHeight = Math.min(PAGE_HEIGHT_PX, totalHeight - offset);
      const band = await html2canvas(body, {
        scale: CANVAS_SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        y: offset,
        height: bandHeight,
      });

      const isLastBand = offset + bandHeight >= totalHeight;
      const cutRow = isLastBand ? band.height : findCutRow(band);
      const image = await pdf.embedPng(await cropToPng(band, cutRow));

      const height = (cutRow / band.width) * CONTENT_WIDTH_PT;
      pdf.addPage([PAGE_WIDTH_PT, PAGE_HEIGHT_PT]).drawImage(image, {
        x: MARGIN_PT,
        y: PAGE_HEIGHT_PT - MARGIN_PT - height,
        width: CONTENT_WIDTH_PT,
        height,
      });

      offset += cutRow / CANVAS_SCALE;
      onProgress(Math.min(offset / totalHeight, 1));
    }

    return await savePdf(pdf);
  } finally {
    frame.remove();
    URL.revokeObjectURL(url);
  }
}
