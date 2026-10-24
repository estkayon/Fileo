import { canvasToBlob, renderImage } from '../../image/imageUtils';
import type { ImageAsset } from './annotationModel';

const MAX_IMAGE_SIDE = 2000;
const JPEG_QUALITY = 0.9;
/** Empty space kept around a signature, in canvas pixels. */
const SIGNATURE_PADDING = 8;

export interface PreparedImage {
  blob: Blob;
  mimeType: ImageAsset['mimeType'];
  aspectRatio: number;
}

async function measureAspectRatio(blob: Blob): Promise<number> {
  const bitmap = await createImageBitmap(blob);
  try {
    return bitmap.width / bitmap.height;
  } finally {
    bitmap.close();
  }
}

/** Re-encodes any browser-readable image as PNG or JPEG, which are the formats a PDF can embed. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await renderImage(file, {
    mimeType,
    quality: JPEG_QUALITY,
    maxSide: MAX_IMAGE_SIDE,
  });
  return { blob, mimeType, aspectRatio: await measureAspectRatio(blob) };
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function findInkBounds(context: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = context.getImageData(0, 0, width, height);
  let bounds: Bounds | null = null;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      bounds = bounds
        ? {
            left: Math.min(bounds.left, x),
            top: Math.min(bounds.top, y),
            right: Math.max(bounds.right, x),
            bottom: Math.max(bounds.bottom, y),
          }
        : { left: x, top: y, right: x, bottom: y };
    }
  }
  return bounds;
}

/** Crops the empty space around the ink. Returns null when nothing was drawn. */
export async function prepareSignature(canvas: HTMLCanvasElement): Promise<PreparedImage | null> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');

  const bounds = findInkBounds(context, canvas.width, canvas.height);
  if (!bounds) return null;

  const left = Math.max(0, bounds.left - SIGNATURE_PADDING);
  const top = Math.max(0, bounds.top - SIGNATURE_PADDING);
  const width = Math.min(canvas.width, bounds.right + SIGNATURE_PADDING + 1) - left;
  const height = Math.min(canvas.height, bounds.bottom + SIGNATURE_PADDING + 1) - top;

  const cropped = document.createElement('canvas');
  cropped.width = width;
  cropped.height = height;
  cropped.getContext('2d')?.drawImage(canvas, left, top, width, height, 0, 0, width, height);

  return {
    blob: await canvasToBlob(cropped, 'image/png', 1),
    mimeType: 'image/png',
    aspectRatio: width / height,
  };
}
