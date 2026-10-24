import { useRef, useState, type PointerEvent } from 'react';
import { prepareSignature, type PreparedImage } from '../features/pdf/annotate/imageAsset';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 300;
const INK_COLOR = '#111827';
const INK_WIDTH = 5;

interface SignaturePadProps {
  onUse: (signature: PreparedImage) => void;
  onCancel: () => void;
}

export function SignaturePad({ onUse, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [error, setError] = useState('');

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.strokeStyle = INK_COLOR;
    context.lineWidth = INK_WIDTH;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    lastPoint.current = point;
    drawSegment(point, point);
    setHasInk(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!lastPoint.current) return;
    const point = pointFromEvent(event);
    drawSegment(lastPoint.current, point);
    lastPoint.current = point;
  };

  const stopDrawing = () => {
    lastPoint.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const use = async () => {
    if (!canvasRef.current) return;
    try {
      const signature = await prepareSignature(canvasRef.current);
      if (signature) onUse(signature);
    } catch {
      setError('Could not save the signature. Try again.');
    }
  };

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        aria-label="Signature drawing area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      {error && <p role="alert">{error}</p>}
      <div className="signature-pad__actions">
        <button type="button" className="action" disabled={!hasInk} onClick={use}>
          Use signature
        </button>
        <button type="button" className="tool" disabled={!hasInk} onClick={clear}>
          Clear
        </button>
        <button type="button" className="tool" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
