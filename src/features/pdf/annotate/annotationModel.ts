/**
 * Annotations are stored in "page units": x and y are fractions of the page width, measured
 * from the top-left corner of the page as it is displayed. Sizes use the same unit. This keeps
 * them independent of the screen size and of the PDF's own coordinate system.
 */
export interface Point {
  x: number;
  y: number;
}

export interface ImageAsset {
  id: string;
  url: string;
  blob: Blob;
  mimeType: 'image/png' | 'image/jpeg';
  /** Width divided by height. */
  aspectRatio: number;
}

interface AnnotationBase {
  id: string;
  pageIndex: number;
}

export interface TextAnnotation extends AnnotationBase {
  kind: 'text';
  /** Top-left corner of the text block. */
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface DrawAnnotation extends AnnotationBase {
  kind: 'draw';
  points: Point[];
  strokeWidth: number;
  color: string;
}

export interface HighlightAnnotation extends AnnotationBase {
  kind: 'highlight';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

/** An image or a signature placed on the page. x and y are the top-left corner. */
export interface ImageAnnotation extends AnnotationBase {
  kind: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  asset: ImageAsset;
}

export type Annotation = TextAnnotation | DrawAnnotation | HighlightAnnotation | ImageAnnotation;

export type ColorTool = 'text' | 'draw' | 'highlight';
export type StampTool = 'image' | 'signature';
export type AnnotationTool = ColorTool | StampTool | 'erase';

export interface AnnotationSettings {
  tool: AnnotationTool;
  colors: Record<ColorTool, string>;
  /** Text size in points on a page that is REFERENCE_PAGE_WIDTH points wide. */
  textSize: number;
  /** Pen thickness in points on a page that is REFERENCE_PAGE_WIDTH points wide. */
  strokeWidth: number;
  /** Width of a placed image or signature, as a percentage of the page width. */
  stampWidth: number;
  /** The image and signature that will be placed on the next click. */
  assets: Record<StampTool, ImageAsset | null>;
}

export interface PageImage {
  url: string | null;
  /** Width divided by height. */
  aspectRatio: number;
}

/** Width of an A4 page in points. Slider values are relative to this width. */
export const REFERENCE_PAGE_WIDTH = 595;

/** Line spacing and baseline position of text, as multiples of the font size. */
export const TEXT_LINE_HEIGHT = 1.2;
export const TEXT_BASELINE = 0.95;

export const DEFAULT_ASPECT_RATIO = 595 / 842;

export const DEFAULT_SETTINGS: AnnotationSettings = {
  tool: 'text',
  colors: { text: '#111827', draw: '#dc2626', highlight: '#fde047' },
  textSize: 16,
  strokeWidth: 3,
  stampWidth: 30,
  assets: { image: null, signature: null },
};

let lastId = 0;

export function createAnnotationId(): string {
  lastId += 1;
  return `annotation-${lastId}`;
}

export function isStampTool(tool: AnnotationTool): tool is StampTool {
  return tool === 'image' || tool === 'signature';
}

export function isColorTool(tool: AnnotationTool): tool is ColorTool {
  return tool === 'text' || tool === 'draw' || tool === 'highlight';
}

export function toPageUnits(points: number): number {
  return points / REFERENCE_PAGE_WIDTH;
}

export function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}

export function addAnnotation(annotations: Annotation[], annotation: Annotation): Annotation[] {
  return [...annotations, annotation];
}

export function removeAnnotation(annotations: Annotation[], id: string): Annotation[] {
  return annotations.filter((annotation) => annotation.id !== id);
}

export function removeLastAnnotation(annotations: Annotation[]): Annotation[] {
  return annotations.slice(0, -1);
}
