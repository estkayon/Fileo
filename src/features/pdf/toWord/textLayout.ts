/** A piece of text from a PDF page, positioned in PDF units (y grows upwards). */
export interface TextPiece {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export interface TextLine {
  text: string;
  x: number;
  endX: number;
  y: number;
  fontSize: number;
}

export interface TextParagraph {
  text: string;
  fontSize: number;
  lineCount: number;
}

/** Pieces whose baselines differ by less than this share of the font size are on one line. */
const SAME_LINE_TOLERANCE = 0.4;
/** A gap wider than this share of the font size between two pieces is a space. */
const WORD_GAP = 0.2;
/** A gap between lines bigger than this many font sizes starts a new paragraph. */
const PARAGRAPH_GAP = 1.7;
/** A font size change bigger than this share starts a new paragraph. */
const FONT_SIZE_CHANGE = 0.15;
/** A line that ends before this share of the page's widest line ends its paragraph. */
const SHORT_LINE_SHARE = 0.75;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function buildLine(pieces: TextPiece[]): TextLine | null {
  const ordered = [...pieces].sort((a, b) => a.x - b.x);
  let text = '';
  let previousEnd: number | null = null;

  for (const piece of ordered) {
    const needsSpace =
      previousEnd !== null &&
      piece.x - previousEnd > piece.fontSize * WORD_GAP &&
      !text.endsWith(' ') &&
      !piece.text.startsWith(' ');
    text += (needsSpace ? ' ' : '') + piece.text;
    previousEnd = piece.x + piece.width;
  }

  const trimmed = text.trim();
  if (!trimmed) return null;

  const dominant = ordered.reduce((best, piece) =>
    piece.text.length > best.text.length ? piece : best,
  );
  return {
    text: trimmed,
    x: ordered[0].x,
    endX: previousEnd ?? ordered[0].x,
    y: dominant.y,
    fontSize: dominant.fontSize,
  };
}

/** Groups pieces that sit on the same baseline into lines, from the top of the page down. */
export function groupIntoLines(pieces: TextPiece[]): TextLine[] {
  const ordered = [...pieces]
    .filter((piece) => piece.text.length > 0)
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const groups: TextPiece[][] = [];
  let current: TextPiece[] = [];

  for (const piece of ordered) {
    const first = current[0];
    if (first && Math.abs(first.y - piece.y) > first.fontSize * SAME_LINE_TOLERANCE) {
      groups.push(current);
      current = [];
    }
    current.push(piece);
  }
  if (current.length > 0) groups.push(current);

  return groups.map(buildLine).filter((line): line is TextLine => line !== null);
}

function joinLines(previous: string, next: string): string {
  // A word split by a hyphen at the end of a line is joined back together.
  if (/[a-z]-$/.test(previous) && /^[a-z]/.test(next)) return previous.slice(0, -1) + next;
  return `${previous} ${next}`;
}

/** Joins the lines of one page into paragraphs. */
export function groupIntoParagraphs(lines: TextLine[]): TextParagraph[] {
  const widestEnd = Math.max(0, ...lines.map((line) => line.endX));
  const leftEdge = Math.min(...lines.map((line) => line.x));
  const paragraphs: TextParagraph[] = [];
  let previous: TextLine | null = null;

  for (const line of lines) {
    const last = paragraphs[paragraphs.length - 1];
    const startsNew =
      !previous ||
      !last ||
      previous.y - line.y > previous.fontSize * PARAGRAPH_GAP ||
      Math.abs(line.fontSize - previous.fontSize) > previous.fontSize * FONT_SIZE_CHANGE ||
      previous.endX - leftEdge < (widestEnd - leftEdge) * SHORT_LINE_SHARE;

    if (startsNew || !last) {
      paragraphs.push({ text: line.text, fontSize: line.fontSize, lineCount: 1 });
    } else {
      last.text = joinLines(last.text, line.text);
      last.lineCount += 1;
    }
    previous = line;
  }
  return paragraphs;
}

/** The most common text size across the document, weighted by amount of text. */
export function findBodyFontSize(paragraphs: TextParagraph[]): number {
  const sizes: number[] = [];
  for (const paragraph of paragraphs) {
    const weight = Math.max(1, Math.round(paragraph.text.length / 20));
    for (let count = 0; count < weight; count += 1) sizes.push(Math.round(paragraph.fontSize));
  }
  return median(sizes);
}

export type HeadingLevel = 1 | 2 | 3;

/** Short paragraphs in a clearly larger font are treated as headings. */
export function getHeadingLevel(
  paragraph: TextParagraph,
  bodyFontSize: number,
): HeadingLevel | null {
  if (paragraph.lineCount > 2 || bodyFontSize === 0) return null;
  const ratio = paragraph.fontSize / bodyFontSize;
  if (ratio >= 1.8) return 1;
  if (ratio >= 1.4) return 2;
  if (ratio >= 1.2) return 3;
  return null;
}
