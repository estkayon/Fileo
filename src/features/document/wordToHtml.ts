import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { buildHtmlDocument } from './htmlDocument';

async function convertDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  try {
    const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    return value;
  } catch {
    throw new Error(`Could not read "${file.name}". Only .docx files are supported.`);
  }
}

export const wordToHtml: Converter = {
  id: 'word-to-html',
  label: 'Word to HTML / PDF',
  accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  async convert([file]) {
    const bodyHtml = await convertDocx(file);
    const title = buildFileName(file.name, '').slice(0, -1);

    return {
      blob: await buildHtmlDocument(title, bodyHtml),
      fileName: buildFileName(file.name, 'html'),
    };
  },
};
