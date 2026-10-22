import type { Converter } from '../types/converter';

interface ToolSelectorProps {
  converters: Converter[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ToolSelector({ converters, selectedId, onSelect }: ToolSelectorProps) {
  return (
    <nav className="tools" aria-label="Converters">
      {converters.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`tool${id === selectedId ? ' tool--active' : ''}`}
          aria-pressed={id === selectedId}
          onClick={() => onSelect(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
