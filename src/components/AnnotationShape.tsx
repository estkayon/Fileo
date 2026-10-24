import {
  splitLines,
  TEXT_BASELINE,
  TEXT_LINE_HEIGHT,
  type Annotation,
} from '../features/pdf/annotate/annotationModel';

/** Smallest clickable width of a drawn line, so thin lines are easy to erase. */
const MIN_HIT_WIDTH = 0.025;

interface AnnotationShapeProps {
  annotation: Annotation;
  onErase?: () => void;
}

export function AnnotationShape({ annotation, onErase }: AnnotationShapeProps) {
  return (
    <g className="annotation" onClick={onErase}>
      {renderShape(annotation)}
    </g>
  );
}

function renderShape(annotation: Annotation) {
  switch (annotation.kind) {
    case 'text':
      return splitLines(annotation.text).map((line, index) => (
        <text
          key={index}
          x={annotation.x}
          y={annotation.y + annotation.fontSize * (TEXT_BASELINE + index * TEXT_LINE_HEIGHT)}
          fontSize={annotation.fontSize}
          fill={annotation.color}
          className="annotation__text"
        >
          {line}
        </text>
      ));
    case 'draw': {
      const points = annotation.points.map(({ x, y }) => `${x},${y}`).join(' ');
      return (
        <>
          <polyline
            points={points}
            fill="none"
            stroke={annotation.color}
            strokeWidth={annotation.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={points}
            fill="none"
            stroke="transparent"
            strokeWidth={Math.max(annotation.strokeWidth, MIN_HIT_WIDTH)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    }
    case 'highlight':
      return (
        <rect
          x={annotation.x}
          y={annotation.y}
          width={annotation.width}
          height={annotation.height}
          fill={annotation.color}
          className="annotation__highlight"
        />
      );
  }
}
