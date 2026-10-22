import type { PDFDocumentProxy } from 'pdfjs-dist';
import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { canvasToBlob } from '../image/imageUtils';
import { withPdf } from './pdfjsUtils';

const MAX_PAGES = 100;

async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, scale: number): Promise<Blob> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvas, viewport }).promise;
  page.cleanup();

  return canvasToBlob(canvas, 'image/png', 1);
}

async function renderAllPages(file: File, scale: number): Promise<Blob[]> {
  return withPdf(file, async (pdf) => {
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Split it into ${MAX_PAGES} pages or fewer first.`,
      );
    }

    const images: Blob[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      images.push(await renderPage(pdf, pageNumber, scale));
    }
    return images;
  });
}

async function zipImages(images: Blob[], baseName: string): Promise<Blob> {
  const { zipSync } = await import('fflate');
  const digits = String(images.length).length;

  const entries: Record<string, Uint8Array> = {};
  for (const [index, image] of images.entries()) {
    const pageLabel = String(index + 1).padStart(digits, '0');
    entries[`${baseName}-page-${pageLabel}.png`] = new Uint8Array(await image.arrayBuffer());
  }

  const zipped = zipSync(entries, { level: 0 });
  return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}

export const pdfToImages: Converter = {
  id: 'pdf-to-images',
  label: 'PDF to images',
  accept: 'application/pdf',
  options: [
    {
      id: 'scale',
      label: 'Resolution',
      input: 'range',
      min: 1,
      max: 4,
      step: 0.5,
      defaultValue: 2,
      unit: 'x',
    },
  ],
  async convert([file], { scale }) {
    const images = await renderAllPages(file, scale);

    if (images.length === 1) {
      return { blob: images[0], fileName: buildFileName(file.name, 'png') };
    }

    const baseName = buildFileName(file.name, '').slice(0, -1);
    return {
      blob: await zipImages(images, baseName),
      fileName: buildFileName(file.name, 'zip', '-images'),
    };
  },
};
