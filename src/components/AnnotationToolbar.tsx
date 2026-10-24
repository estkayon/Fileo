import {
  isColorTool,
  isStampTool,
  type AnnotationSettings,
  type AnnotationTool,
} from '../features/pdf/annotate/annotationModel';

interface ToolOption {
  tool: AnnotationTool;
  label: string;
  hint: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  { tool: 'text', label: 'Text', hint: 'Click on a page, type, then click outside to place it.' },
  { tool: 'draw', label: 'Draw', hint: 'Press and drag on a page to draw.' },
  { tool: 'highlight', label: 'Highlight', hint: 'Drag over an area to highlight it.' },
  { tool: 'image', label: 'Image', hint: 'Choose an image, then click on a page to place it.' },
  {
    tool: 'signature',
    label: 'Signature',
    hint: 'Draw your signature, then click on a page to place it.',
  },
  { tool: 'erase', label: 'Erase', hint: 'Click something you added to remove it.' },
];

interface AnnotationToolbarProps {
  settings: AnnotationSettings;
  canUndo: boolean;
  onChange: (settings: AnnotationSettings) => void;
  onUndo: () => void;
  onImageFile: (file: File) => void;
  onDrawSignature: () => void;
}

export function AnnotationToolbar({
  settings,
  canUndo,
  onChange,
  onUndo,
  onImageFile,
  onDrawSignature,
}: AnnotationToolbarProps) {
  const { tool } = settings;
  const hint = TOOL_OPTIONS.find((option) => option.tool === tool)?.hint;
  const stamp = isStampTool(tool) ? settings.assets[tool] : null;

  return (
    <div className="annotate-toolbar" role="toolbar" aria-label="Editing tools">
      <div className="annotate-toolbar__row">
        {TOOL_OPTIONS.map((option) => (
          <button
            key={option.tool}
            type="button"
            className={`tool${option.tool === tool ? ' tool--active' : ''}`}
            aria-pressed={option.tool === tool}
            onClick={() => onChange({ ...settings, tool: option.tool })}
          >
            {option.label}
          </button>
        ))}
        <button type="button" className="tool" disabled={!canUndo} onClick={onUndo}>
          Undo
        </button>
      </div>

      <div className="annotate-toolbar__row">
        {isColorTool(tool) && (
          <label className="annotate-toolbar__field">
            <span>Color</span>
            <input
              type="color"
              value={settings.colors[tool]}
              onChange={(event) =>
                onChange({
                  ...settings,
                  colors: { ...settings.colors, [tool]: event.target.value },
                })
              }
            />
          </label>
        )}
        {tool === 'text' && (
          <label className="annotate-toolbar__field">
            <span>Size</span>
            <input
              type="range"
              min={8}
              max={72}
              step={1}
              value={settings.textSize}
              onChange={(event) => onChange({ ...settings, textSize: Number(event.target.value) })}
            />
            <output>{settings.textSize}</output>
          </label>
        )}
        {tool === 'draw' && (
          <label className="annotate-toolbar__field">
            <span>Thickness</span>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={settings.strokeWidth}
              onChange={(event) =>
                onChange({ ...settings, strokeWidth: Number(event.target.value) })
              }
            />
            <output>{settings.strokeWidth}</output>
          </label>
        )}
        {tool === 'image' && (
          <label className="tool">
            {stamp ? 'Change image' : 'Choose image'}
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={(event) => {
                const [file] = event.target.files ?? [];
                if (file) onImageFile(file);
                event.target.value = '';
              }}
            />
          </label>
        )}
        {tool === 'signature' && (
          <button type="button" className="tool" onClick={onDrawSignature}>
            {stamp ? 'Redraw signature' : 'Draw signature'}
          </button>
        )}
        {stamp && (
          <>
            <img className="stamp-preview" src={stamp.url} alt="Selected" />
            <label className="annotate-toolbar__field">
              <span>Width</span>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={settings.stampWidth}
                onChange={(event) =>
                  onChange({ ...settings, stampWidth: Number(event.target.value) })
                }
              />
              <output>{settings.stampWidth}%</output>
            </label>
          </>
        )}
      </div>

      <p className="annotate-toolbar__hint">{hint}</p>
    </div>
  );
}
