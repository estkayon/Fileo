import type { PDFDocument } from 'pdf-lib';

export async function createPdf(): Promise<PDFDocument> {
  const { PDFDocument: Document } = await import('pdf-lib');
  return Document.create();
}

export async function readPdf(file: File): Promise<PDFDocument> {
  const { PDFDocument: Document } = await import('pdf-lib');
  try {
    return await Document.load(await file.arrayBuffer());
  } catch {
    throw new Error(`Could not read "${file.name}". It may be damaged or password protected.`);
  }
}

export async function savePdf(pdf: PDFDocument): Promise<Blob> {
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
