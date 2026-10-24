import type { PDFDocumentProxy } from 'pdfjs-dist';
import { buildFileName } from '../../../lib/fileName';
import type { Converter } from '../../../types/converter';
import { withPdf } from '../pdfjsUtils';
import {
  findBodyFontSize,
  getHeadingLevel,
  groupIntoLines,
  groupIntoParagraphs,
  type TextPiece,
  type TextParagraph,
} from './textLayout';

const MAX_PAGES = 200;
/** One PDF point is 20 twentieths of a point ("twips"), the unit Word uses for page size. */
const TWIPS_PER_POINT = 20;
const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 72;

interface PageContent {
  paragraphs: TextParagraph[];
}

interface DocumentContent {
  pages: PageContent[];
  /** Size of the first page in points. */
  pageWidth: number;
  pageHeight: number;
}

async function readPageParagraphs(pdf: PDFDocumentProxy, pageNumber: number) {
  const page = await pdf.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    const pieces: TextPiece[] = [];

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const [a, b, , , x, y] = item.transform as number[];
      pieces.push({
        text: item.str,
        x,
        y,
        width: item.width,
        fontSize: Math.hypot(a, b),
      });
    }

    const { width, height } = page.getViewport({ scale: 1 });
    return { paragraphs: groupIntoParagraphs(groupIntoLines(pieces)), width, height };
  } finally {
    page.cleanup();
  }
}

async function readDocument(
  file: File,
  onProgress: (fraction: number) => void,
): Promise<DocumentContent> {
  return withPdf(file, async (pdf) => {
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Split it into ${MAX_PAGES} pages or fewer first.`,
      );
    }

    const pages: PageContent[] = [];
    let pageWidth = 0;
    let pageHeight = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const { paragraphs, width, height } = await readPageParagraphs(pdf, pageNumber);
      if (pageNumber === 1) {
        pageWidth = width;
        pageHeight = height;
      }
      pages.push({ paragraphs });
      onProgress(pageNumber / pdf.numPages);
    }
    return { pages, pageWidth, pageHeight };
  });
}

async function buildDocx({ pages, pageWidth, pageHeight }: DocumentContent): Promise<Blob> {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const headingLevels = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  };

  const bodyFontSize = findBodyFontSize(pages.flatMap((page) => page.paragraphs));
  const children: InstanceType<typeof Paragraph>[] = [];
  let isFirstOnPage = false;

  pages.forEach((page, pageIndex) => {
    isFirstOnPage = pageIndex > 0;
    for (const paragraph of page.paragraphs) {
      const level = getHeadingLevel(paragraph, bodyFontSize);
      const size = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, paragraph.fontSize));

      children.push(
        new Paragraph({
          heading: level ? headingLevels[level] : undefined,
          pageBreakBefore: isFirstOnPage,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: paragraph.text,
              size: Math.round(size * 2),
              // Word's default heading style is blue and not bold. The PDF's own look is kept.
              bold: level !== null,
              color: level ? '000000' : undefined,
            }),
          ],
        }),
      );
      isFirstOnPage = false;
    }
  });

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: Math.round(pageWidth * TWIPS_PER_POINT),
              height: Math.round(pageHeight * TWIPS_PER_POINT),
            },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBlob(document);
}

export const pdfToWord: Converter = {
  id: 'pdf-to-word',
  label: 'PDF to Word',
  accept: 'application/pdf',
  async convert([file], _options, { onProgress }) {
    const content = await readDocument(file, onProgress);

    if (content.pages.every((page) => page.paragraphs.length === 0)) {
      throw new Error('No selectable text found. This PDF may contain scanned images only.');
    }

    return {
      blob: await buildDocx(content),
      fileName: buildFileName(file.name, 'docx'),
    };
  },
};
