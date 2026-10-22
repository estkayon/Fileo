import { buildFileName } from '../../lib/fileName';
import type { Converter } from '../../types/converter';
import { renderImage } from './imageUtils';

export const compressImage: Converter = {
  id: 'image-compress',
  label: 'Compress image',
  accept: 'image/*',
  options: [
    {
      id: 'quality',
      label: 'Quality',
      input: 'range',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 75,
      unit: '%',
    },
  ],
  async convert([file], { quality }) {
    return {
      blob: await renderImage(file, { mimeType: 'image/jpeg', quality: quality / 100 }),
      fileName: buildFileName(file.name, 'jpg', '-compressed'),
    };
  },
};
