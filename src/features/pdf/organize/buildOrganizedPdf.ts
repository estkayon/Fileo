import { buildFileName } from '../../../lib/fileName';
import type { ConversionResult } from '../../../types/converter';
import { createPdf, readPdf, savePdf } from '../pdfUtils';
import { keptPages, normalizeRotation, type PageEntry } from './pageModel';

export async function buildOrganizedPdf(file: File, pages: PageEntry[]): Promise<ConversionResult> {
  const kept = keptPages(pages);
  if (kept.length === 0) throw new Error('Keep at least one page before saving.');

  const [{ degrees }, source, output] = await Promise.all([
    import('pdf-lib'),
    readPdf(file),
    createPdf(),
  ]);
  const copied = await output.copyPages(
    source,
    kept.map((page) => page.sourceIndex),
  );

  copied.forEach((page, index) => {
    const rotation = normalizeRotation(page.getRotation().angle + kept[index].rotation);
    page.setRotation(degrees(rotation));
    output.addPage(page);
  });

  return {
    blob: await savePdf(output),
    fileName: buildFileName(file.name, 'pdf', '-organized'),
  };
}
