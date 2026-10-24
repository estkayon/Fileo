import type { PDFFont, PDFPage } from 'pdf-lib';
import { buildFileName } from '../../../lib/fileName';
import type { ConversionResult } from '../../../types/converter';
import { normalizeRotation } from '../organize/pageModel';
import { readPdf, savePdf } from '../pdfUtils';
import { splitLines, TEXT_BASELINE, TEXT_LINE_HEIGHT, type Annotation } from './annotationModel';

type PdfLib = typeof import('pdf-lib');

const UNSUPPORTED_TEXT_MESSAGE =
  'Some text uses characters that cannot be saved yet. Use English letters, numbers and common symbols.';

/** Converts positions on the displayed (upright) page into PDF page coordinates. */
function createPageMapper(page: PDFPage) {
  const { x: left, y: bottom, width, height } = page.getCropBox();
  const rotation = normalizeRotation(page.getRotation().angle);
  const scale = rotation % 180 === 0 ? width : height;

  function toPage(u: number, v: number) {
    switch (rotation) {
      case 90:
        return { x: left + v, y: bottom + u };
      case 180:
        return { x: left + width - u, y: bottom + v };
      case 270:
        return { x: left + width - v, y: bottom + height - u };
      default:
        return { x: left + u, y: bottom + height - v };
    }
  }

  return { rotation, scale, toPage };
}

function parseColor({ rgb }: PdfLib, hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function drawAnnotation(pdfLib: PdfLib, page: PDFPage, font: PDFFont, annotation: Annotation) {
  const { rotation, scale, toPage } = createPageMapper(page);
  const color = parseColor(pdfLib, annotation.color);

  switch (annotation.kind) {
    case 'text': {
      const size = annotation.fontSize * scale;
      splitLines(annotation.text).forEach((line, index) => {
        if (!line) return;
        const baseline =
          annotation.y + annotation.fontSize * (TEXT_BASELINE + index * TEXT_LINE_HEIGHT);
        const { x, y } = toPage(annotation.x * scale, baseline * scale);
        page.drawText(line, { x, y, size, font, color, rotate: pdfLib.degrees(rotation) });
      });
      break;
    }
    case 'draw': {
      const points = annotation.points.map((point) => toPage(point.x * scale, point.y * scale));
      for (let index = 1; index < points.length; index += 1) {
        page.drawLine({
          start: points[index - 1],
          end: points[index],
          thickness: annotation.strokeWidth * scale,
          color,
          lineCap: pdfLib.LineCapStyle.Round,
        });
      }
      break;
    }
    case 'highlight': {
      const first = toPage(annotation.x * scale, annotation.y * scale);
      const second = toPage(
        (annotation.x + annotation.width) * scale,
        (annotation.y + annotation.height) * scale,
      );
      page.drawRectangle({
        x: Math.min(first.x, second.x),
        y: Math.min(first.y, second.y),
        width: Math.abs(second.x - first.x),
        height: Math.abs(second.y - first.y),
        color,
        // Multiply keeps the text under the highlight readable.
        blendMode: pdfLib.BlendMode.Multiply,
      });
      break;
    }
  }
}

export async function buildAnnotatedPdf(
  file: File,
  annotations: Annotation[],
): Promise<ConversionResult> {
  if (annotations.length === 0) throw new Error('Add something to the PDF before saving.');

  const [pdfLib, pdf] = await Promise.all([import('pdf-lib'), readPdf(file)]);
  const font = await pdf.embedFont(pdfLib.StandardFonts.Helvetica);
  const pages = pdf.getPages();

  try {
    for (const annotation of annotations) {
      const page = pages[annotation.pageIndex];
      if (page) drawAnnotation(pdfLib, page, font, annotation);
    }
  } catch {
    throw new Error(UNSUPPORTED_TEXT_MESSAGE);
  }

  return {
    blob: await savePdf(pdf),
    fileName: buildFileName(file.name, 'pdf', '-edited'),
  };
}
