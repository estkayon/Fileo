import type { PDFDocument, PDFImage } from 'pdf-lib';
import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { createPdf, savePdf } from './pdfUtils';

const A4_SHORT_SIDE = 595.28;
const A4_LONG_SIDE = 841.89;

async function embedImage(pdf: PDFDocument, file: File): Promise<PDFImage> {
  const bytes = await file.arrayBuffer();
  if (file.type === 'image/png') return pdf.embedPng(bytes);
  if (file.type === 'image/jpeg') return pdf.embedJpg(bytes);
  throw new Error(`"${file.name}" is not a PNG or JPG image.`);
}

export const imagesToPdf: Converter = {
  id: 'images-to-pdf',
  label: 'Images to PDF',
  accept: 'image/png,image/jpeg',
  multiple: true,
  async convert(files) {
    const output = await createPdf();

    for (const file of files) {
      const image = await embedImage(output, file);
      const isLandscape = image.width > image.height;
      const pageWidth = isLandscape ? A4_LONG_SIDE : A4_SHORT_SIDE;
      const pageHeight = isLandscape ? A4_SHORT_SIDE : A4_LONG_SIDE;

      const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
      const width = image.width * scale;
      const height = image.height * scale;

      output.addPage([pageWidth, pageHeight]).drawImage(image, {
        x: (pageWidth - width) / 2,
        y: (pageHeight - height) / 2,
        width,
        height,
      });
    }

    const fileName = files.length === 1 ? buildFileName(files[0].name, 'pdf') : 'images.pdf';
    return { blob: await savePdf(output), fileName };
  },
};
