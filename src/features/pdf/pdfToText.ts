import type { PDFDocumentProxy } from 'pdfjs-dist';
import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { withPdf } from './pdfjsUtils';

async function extractPageText(pdf: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  page.cleanup();

  return content.items
    .map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : ''))
    .join('');
}

export const pdfToText: Converter = {
  id: 'pdf-to-text',
  label: 'PDF to text',
  accept: 'application/pdf',
  async convert([file], _options, { onProgress }) {
    const text = await withPdf(file, async (pdf) => {
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        pages.push(await extractPageText(pdf, pageNumber));
        onProgress(pageNumber / pdf.numPages);
      }
      return pages.join('\n\n').trim();
    });

    if (!text) {
      throw new Error('No selectable text found. This PDF may contain scanned images only.');
    }

    return {
      blob: new Blob([text], { type: 'text/plain;charset=utf-8' }),
      fileName: buildFileName(file.name, 'txt'),
    };
  },
};
