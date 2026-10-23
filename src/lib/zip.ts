import type { ConversionResult } from '../types/converter';

function toUniqueName(fileName: string, usedNames: Set<string>): string {
  if (!usedNames.has(fileName)) return fileName;

  const dotIndex = fileName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const extension = dotIndex > 0 ? fileName.slice(dotIndex) : '';

  let counter = 2;
  while (usedNames.has(`${baseName} (${counter})${extension}`)) counter += 1;
  return `${baseName} (${counter})${extension}`;
}

export async function zipResults(results: ConversionResult[]): Promise<Blob> {
  const { zipSync } = await import('fflate');
  const entries: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();

  for (const { blob, fileName } of results) {
    const name = toUniqueName(fileName, usedNames);
    usedNames.add(name);
    entries[name] = new Uint8Array(await blob.arrayBuffer());
  }

  // Level 0 only stores the files. Most of them are already compressed, and it keeps the UI fast.
  const zipped = zipSync(entries, { level: 0 });
  return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}
