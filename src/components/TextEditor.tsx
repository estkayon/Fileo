import { useRef, type KeyboardEvent } from 'react';
import { TEXT_LINE_HEIGHT } from '../features/pdf/annotate/annotationModel';

interface TextEditorProps {
  /** Position of the text block, in page units. */
  x: number;
  y: number;
  aspectRatio: number;
  fontSize: number;
  color: string;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export function TextEditor({
  x,
  y,
  aspectRatio,
  fontSize,
  color,
  onCommit,
  onCancel,
}: TextEditorProps) {
  const finished = useRef(false);

  const finish = (text: string | null) => {
    if (finished.current) return;
    finished.current = true;
    if (text === null) onCancel();
    else onCommit(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') finish(null);
  };

  return (
    <textarea
      className="text-editor"
      aria-label="Text to add"
      rows={1}
      autoFocus
      style={{
        left: `${x * 100}%`,
        top: `${y * aspectRatio * 100}%`,
        width: `min(50cqw, ${(1 - x) * 100}cqw)`,
        fontSize: `${fontSize * 100}cqw`,
        lineHeight: TEXT_LINE_HEIGHT,
        color,
      }}
      onInput={(event) => {
        event.currentTarget.style.height = 'auto';
        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
      }}
      onKeyDown={handleKeyDown}
      onBlur={(event) => finish(event.currentTarget.value)}
    />
  );
}
