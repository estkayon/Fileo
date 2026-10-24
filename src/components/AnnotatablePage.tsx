import { useState, type MouseEvent, type PointerEvent } from 'react';
import {
  createAnnotationId,
  toPageUnits,
  type Annotation,
  type AnnotationSettings,
  type PageImage,
  type Point,
} from '../features/pdf/annotate/annotationModel';
import { AnnotationShape } from './AnnotationShape';
import { TextEditor } from './TextEditor';

/** Pen points closer than this (in page units) are skipped to keep strokes small. */
const MIN_POINT_DISTANCE = 0.002;
/** Highlights smaller than this (in page units) are treated as accidental clicks. */
const MIN_HIGHLIGHT_SIZE = 0.005;

interface AnnotatablePageProps {
  pageIndex: number;
  page: PageImage;
  annotations: Annotation[];
  settings: AnnotationSettings;
  onAdd: (annotation: Annotation) => void;
  onRemove: (id: string) => void;
}

type Draft = { kind: 'draw'; points: Point[] } | { kind: 'highlight'; start: Point; end: Point };

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function pointFromEvent(event: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 1),
    y: clamp((event.clientY - rect.top) / rect.width, rect.height / rect.width),
  };
}

export function AnnotatablePage({
  pageIndex,
  page,
  annotations,
  settings,
  onAdd,
  onRemove,
}: AnnotatablePageProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editorAt, setEditorAt] = useState<Point | null>(null);
  const { tool } = settings;
  const textFontSize = toPageUnits(settings.textSize);

  const draftAnnotation = (): Annotation | null => {
    if (!draft) return null;
    if (draft.kind === 'draw') {
      return {
        id: 'draft',
        kind: 'draw',
        pageIndex,
        color: settings.colors.draw,
        points: draft.points,
        strokeWidth: toPageUnits(settings.strokeWidth),
      };
    }
    return {
      id: 'draft',
      kind: 'highlight',
      pageIndex,
      color: settings.colors.highlight,
      x: Math.min(draft.start.x, draft.end.x),
      y: Math.min(draft.start.y, draft.end.y),
      width: Math.abs(draft.end.x - draft.start.x),
      height: Math.abs(draft.end.y - draft.start.y),
    };
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (tool !== 'draw' && tool !== 'highlight') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setDraft(
      tool === 'draw'
        ? { kind: 'draw', points: [point] }
        : { kind: 'highlight', start: point, end: point },
    );
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!draft) return;
    const point = pointFromEvent(event);

    if (draft.kind === 'highlight') {
      setDraft({ ...draft, end: point });
      return;
    }

    const last = draft.points[draft.points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_POINT_DISTANCE) return;
    setDraft({ ...draft, points: [...draft.points, point] });
  };

  const handlePointerUp = () => {
    const finished = draftAnnotation();
    setDraft(null);
    if (!finished) return;

    if (finished.kind === 'draw') {
      // A single tap becomes a dot: a zero-length line drawn with round caps.
      const points =
        finished.points.length === 1 ? [...finished.points, finished.points[0]] : finished.points;
      onAdd({ ...finished, id: createAnnotationId(), points });
    } else if (
      finished.kind === 'highlight' &&
      finished.width > MIN_HIGHLIGHT_SIZE &&
      finished.height > MIN_HIGHLIGHT_SIZE
    ) {
      onAdd({ ...finished, id: createAnnotationId() });
    }
  };

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (tool === 'text') setEditorAt(pointFromEvent(event));
  };

  const commitText = (text: string) => {
    if (editorAt && text.trim()) {
      onAdd({
        id: createAnnotationId(),
        kind: 'text',
        pageIndex,
        color: settings.colors.text,
        x: editorAt.x,
        y: editorAt.y,
        text,
        fontSize: textFontSize,
      });
    }
    setEditorAt(null);
  };

  const preview = draftAnnotation();

  return (
    <div className="annotatable-page" style={{ aspectRatio: page.aspectRatio }}>
      {page.url ? (
        <img className="annotatable-page__image" src={page.url} alt="" draggable={false} />
      ) : (
        <span className="annotatable-page__placeholder">Loading...</span>
      )}

      <svg
        className={`annotation-layer annotation-layer--${tool}`}
        viewBox={`0 0 1 ${1 / page.aspectRatio}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDraft(null)}
        onClick={handleClick}
      >
        {annotations.map((annotation) => (
          <AnnotationShape
            key={annotation.id}
            annotation={annotation}
            onErase={tool === 'erase' ? () => onRemove(annotation.id) : undefined}
          />
        ))}
        {preview && <AnnotationShape annotation={preview} />}
      </svg>

      {editorAt && (
        <TextEditor
          x={editorAt.x}
          y={editorAt.y}
          aspectRatio={page.aspectRatio}
          fontSize={textFontSize}
          color={settings.colors.text}
          onCommit={commitText}
          onCancel={() => setEditorAt(null)}
        />
      )}
    </div>
  );
}
