/**
 * Annotations are stored in "page units": x and y are fractions of the page width, measured
 * from the top-left corner of the page as it is displayed. Sizes use the same unit. This keeps
 * them independent of the screen size and of the PDF's own coordinate system.
 */
export interface Point {
  x: number;
  y: number;
}

interface AnnotationBase {
  id: string;
  pageIndex: number;
  color: string;
}

export interface TextAnnotation extends AnnotationBase {
  kind: 'text';
  /** Top-left corner of the text block. */
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface DrawAnnotation extends AnnotationBase {
  kind: 'draw';
  points: Point[];
  strokeWidth: number;
}

export interface HighlightAnnotation extends AnnotationBase {
  kind: 'highlight';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Annotation = TextAnnotation | DrawAnnotation | HighlightAnnotation;

export type AnnotationTool = 'text' | 'draw' | 'highlight' | 'erase';
export type ColorTool = Exclude<AnnotationTool, 'erase'>;

export interface AnnotationSettings {
  tool: AnnotationTool;
  colors: Record<ColorTool, string>;
  /** Text size in points on a page that is REFERENCE_PAGE_WIDTH points wide. */
  textSize: number;
  /** Pen thickness in points on a page that is REFERENCE_PAGE_WIDTH points wide. */
  strokeWidth: number;
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
};

let lastId = 0;

export function createAnnotationId(): string {
  lastId += 1;
  return `annotation-${lastId}`;
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
