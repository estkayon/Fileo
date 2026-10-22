import type { Converter } from '../../types/converter';
import { buildFileName, renderImage } from './imageUtils';

const MIN_SIDE = 16;
const MAX_SIDE = 8000;

const OUTPUT_EXTENSIONS = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);

export const resizeImage: Converter = {
  id: 'image-resize',
  label: 'Resize image',
  accept: 'image/*',
  options: [
    {
      id: 'longestSide',
      label: 'Longest side',
      input: 'number',
      min: MIN_SIDE,
      max: MAX_SIDE,
      step: 1,
      defaultValue: 1280,
      unit: 'px',
    },
  ],
  async convert(file, { longestSide }) {
    if (!Number.isFinite(longestSide) || longestSide < MIN_SIDE || longestSide > MAX_SIDE) {
      throw new Error(`Enter a size between ${MIN_SIDE} and ${MAX_SIDE} px.`);
    }

    const knownExtension = OUTPUT_EXTENSIONS.get(file.type);
    const mimeType = knownExtension ? file.type : 'image/png';
    const extension = knownExtension ?? 'png';

    return {
      blob: await renderImage(file, { mimeType, longestSide: Math.round(longestSide) }),
      fileName: buildFileName(file.name, extension, '-resized'),
    };
  },
};
