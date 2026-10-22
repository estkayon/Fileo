import type { Converter } from '../../types/converter';

interface ImageFormat {
  id: string;
  label: string;
  mimeType: string;
  extension: string;
}

const QUALITY = 0.92;

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not create the converted file.'))),
      mimeType,
      QUALITY,
    );
  });
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error('This file is not a supported image.');
  }
}

export function createImageConverter(format: ImageFormat): Converter {
  return {
    id: format.id,
    label: format.label,
    accept: 'image/*',
    async convert(file) {
      const bitmap = await decodeImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        throw new Error('Canvas is not supported in this browser.');
      }

      if (format.mimeType === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0);
      bitmap.close();

      const blob = await canvasToBlob(canvas, format.mimeType);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      return { blob, fileName: `${baseName}.${format.extension}` };
    },
  };
}
