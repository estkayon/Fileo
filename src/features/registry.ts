import type { Converter } from '../types/converter';
import { compressImage } from './image/compressImage';
import { createImageConverter } from './image/createImageConverter';
import { resizeImage } from './image/resizeImage';
import { extractPages } from './pdf/extractPages';
import { imagesToPdf } from './pdf/imagesToPdf';
import { mergePdf } from './pdf/mergePdf';
import { pdfToImages } from './pdf/pdfToImages';
import { pdfToText } from './pdf/pdfToText';

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
  compressImage,
  resizeImage,
  imagesToPdf,
  mergePdf,
  extractPages,
  mergePdf,
  extractPages,
  pdfToImages,
  pdfToText,
];
