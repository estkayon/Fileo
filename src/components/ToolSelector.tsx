import type { ToolGroup } from '../types/converter';

interface ToolSelectorProps {
  groups: ToolGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ToolSelector({ groups, selectedId, onSelect }: ToolSelectorProps) {
  return (
    <nav className="tools" aria-label="Converters">
      {groups.map(({ title, converters }) => (
        <section key={title} className="tool-group">
          <h2 className="tool-group__title">{title}</h2>
          <div className="tool-group__items">
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
          </div>
        </section>
      ))}
    </nav>
  );
}
