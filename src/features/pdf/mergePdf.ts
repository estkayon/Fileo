import type { Converter } from '../../types/converter';
import { createPdf, readPdf, savePdf } from './pdfUtils';

export const mergePdf: Converter = {
  id: 'pdf-merge',
  label: 'Merge PDFs',
  accept: 'application/pdf',
  inputMode: 'merge',
  async convert(files) {
    if (files.length < 2) throw new Error('Add at least two PDF files to merge.');

    const output = await createPdf();
    for (const file of files) {
      const source = await readPdf(file);
      const pages = await output.copyPages(source, source.getPageIndices());
      pages.forEach((page) => output.addPage(page));
    }

    return { blob: await savePdf(output), fileName: 'merged.pdf' };
  },
};
