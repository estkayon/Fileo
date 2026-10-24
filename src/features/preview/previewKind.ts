import type { ConversionResult } from '../../types/converter';

export type PreviewKind = 'image' | 'pdf' | 'html' | 'text' | 'docx' | 'zip';

/** Decides how a result can be previewed. Returns null when there is no preview for it. */
export function getPreviewKind({ blob, fileName }: ConversionResult): PreviewKind | null {
  if (blob.type.startsWith('image/')) return 'image';
  if (blob.type === 'application/pdf') return 'pdf';
  if (blob.type.startsWith('text/html')) return 'html';
  if (blob.type.startsWith('text/plain')) return 'text';
  if (blob.type === 'application/zip') return 'zip';
  if (fileName.toLowerCase().endsWith('.docx')) return 'docx';
  return null;
}
