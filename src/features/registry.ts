import type { Converter } from '../types/converter';
import { compressImage } from './image/compressImage';
import { createImageConverter } from './image/createImageConverter';
import { resizeImage } from './image/resizeImage';

export const converters: Converter[] = [
  createImageConverter({
    id: 'image-to-png',
    label: 'Image to PNG',
    mimeType: 'image/png',
    extension: 'png',
  }),
  createImageConverter({
    id: 'image-to-jpg',
    label: 'Image to JPG',
    mimeType: 'image/jpeg',
    extension: 'jpg',
  }),
  createImageConverter({
    id: 'image-to-webp',
    label: 'Image to WebP',
    mimeType: 'image/webp',
    extension: 'webp',
  }),
  compressImage,
  resizeImage,
];
