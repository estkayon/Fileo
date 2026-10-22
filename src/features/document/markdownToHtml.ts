import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { buildHtmlDocument } from './htmlDocument';

export const markdownToHtml: Converter = {
  id: 'markdown-to-html',
  label: 'Markdown to HTML / PDF',
  accept: '.md,.markdown,text/markdown,text/plain',
  async convert([file]) {
    const { marked } = await import('marked');
    const bodyHtml = await marked.parse(await file.text(), { async: true });
    const title = buildFileName(file.name, '').slice(0, -1);

    return {
      blob: await buildHtmlDocument(title, bodyHtml),
      fileName: buildFileName(file.name, 'html'),
    };
  },
};
