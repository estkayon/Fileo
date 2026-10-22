import type { Converter } from '../../types/converter';
import { buildFileName, renderImage } from './imageUtils';

interface ImageFormat {
  id: string;
  label: string;
  mimeType: string;
  extension: string;
}

export function createImageConverter(format: ImageFormat): Converter {
  return {
    id: format.id,
    label: format.label,
    accept: 'image/*',
    async convert(file) {
      return {
        blob: await renderImage(file, { mimeType: format.mimeType }),
        fileName: buildFileName(file.name, format.extension),
      };
    },
  };
}
