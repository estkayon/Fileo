import type { PDFDocumentProxy } from 'pdfjs-dist';

async function loadPdfjs() {
  const [pdfjs, { default: workerSrc }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjs;
}

export async function withPdf<T>(
  file: File,
  task: (pdf: PDFDocumentProxy) => Promise<T>,
): Promise<T> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });

  try {
    let pdf: PDFDocumentProxy;
    try {
      pdf = await loadingTask.promise;
    } catch {
      throw new Error(`Could not read "${file.name}". It may be damaged or password protected.`);
    }
    return await task(pdf);
  } finally {
    await loadingTask.destroy();
  }
}
