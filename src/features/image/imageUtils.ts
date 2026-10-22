const DEFAULT_QUALITY = 0.92;

interface RenderOptions {
  mimeType: string;
  quality?: number;
  longestSide?: number;
}
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not create the converted file.'));
        } else if (blob.type !== mimeType) {
          reject(new Error('This browser cannot export that format. Try another format.'));
        } else {
          resolve(blob);
        }
      },
      mimeType,
      quality,
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

export async function renderImage(
  file: File,
  { mimeType, quality = DEFAULT_QUALITY, longestSide }: RenderOptions,
): Promise<Blob> {
  const bitmap = await decodeImage(file);
  try {
    const scale = longestSide ? longestSide / Math.max(bitmap.width, bitmap.height) : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported in this browser.');

    if (mimeType === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await canvasToBlob(canvas, mimeType, quality);
  } finally {
    bitmap.close();
  }
}
