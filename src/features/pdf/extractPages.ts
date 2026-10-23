import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { createPdf, readPdf, savePdf } from './pdfUtils';

export const extractPages: Converter = {
  id: 'pdf-extract-pages',
  label: 'Split PDF',
  accept: 'application/pdf',
  inputMode: 'single',
  options: [
    {
      id: 'from',
      label: 'From page',
      input: 'number',
      min: 1,
      max: 9999,
      step: 1,
      defaultValue: 1,
    },
    { id: 'to', label: 'To page', input: 'number', min: 1, max: 9999, step: 1, defaultValue: 1 },
  ],
  async convert([file], { from, to }) {
    const source = await readPdf(file);
    const pageCount = source.getPageCount();

    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 1 ||
      to < from ||
      to > pageCount
    ) {
      throw new Error(`Enter a valid page range between 1 and ${pageCount}.`);
    }

    const indices = Array.from({ length: to - from + 1 }, (_, offset) => from - 1 + offset);
    const output = await createPdf();
    const pages = await output.copyPages(source, indices);
    pages.forEach((page) => output.addPage(page));

    return {
      blob: await savePdf(output),
      fileName: buildFileName(file.name, 'pdf', `-pages-${from}-${to}`),
    };
  },
};
