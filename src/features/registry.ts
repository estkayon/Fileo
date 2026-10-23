import type { ConverterGroup } from '../types/converter';
import { markdownToHtml } from './document/markdownToHtml';
import { createImageConverter } from './image/createImageConverter';
import { compressImage } from './image/compressImage';
import { resizeImage } from './image/resizeImage';
import { extractPages } from './pdf/extractPages';
import { imagesToPdf } from './pdf/imagesToPdf';
import { mergePdf } from './pdf/mergePdf';
import { pdfToImages } from './pdf/pdfToImages';
import { pdfToText } from './pdf/pdfToText';
import { wordToHtml } from './document/wordToHtml';

export const converterGroups: ConverterGroup[] = [
  {
    title: 'Image',
    converters: [
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
    ],
  },
  {
    title: 'PDF',
    converters: [imagesToPdf, mergePdf, extractPages, pdfToImages, pdfToText],
  },
  {
    title: 'Documents',
    converters: [wordToHtml, markdownToHtml],
  },
];
