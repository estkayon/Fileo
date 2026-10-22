import type { ConversionResult } from '../types/converter';

export function downloadResult({ blob, fileName }: ConversionResult): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
