import type {
  AnnotationSettings,
  AnnotationTool,
  ColorTool,
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
  { tool: 'erase', label: 'Erase', hint: 'Click something you added to remove it.' },
];

interface AnnotationToolbarProps {
  settings: AnnotationSettings;
  canUndo: boolean;
  onChange: (settings: AnnotationSettings) => void;
  onUndo: () => void;
}

export function AnnotationToolbar({ settings, canUndo, onChange, onUndo }: AnnotationToolbarProps) {
  const { tool } = settings;
  const hint = TOOL_OPTIONS.find((option) => option.tool === tool)?.hint;

  const setColor = (color: string) => {
    if (tool === 'erase') return;
    const colorTool: ColorTool = tool;
    onChange({ ...settings, colors: { ...settings.colors, [colorTool]: color } });
  };

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
        {tool !== 'erase' && (
          <label className="annotate-toolbar__field">
            <span>Color</span>
            <input
              type="color"
              value={settings.colors[tool]}
              onChange={(event) => setColor(event.target.value)}
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
      </div>

      <p className="annotate-toolbar__hint">{hint}</p>
    </div>
  );
}
