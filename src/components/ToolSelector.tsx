interface ToolEntry {
  id: string;
  label: string;
}

interface ToolSelectorGroup {
  title: string;
  tools: ToolEntry[];
}

interface ToolSelectorProps {
  groups: ToolSelectorGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ToolSelector({ groups, selectedId, onSelect }: ToolSelectorProps) {
  return (
    <nav className="tools" aria-label="Tools">
      {groups.map(({ title, tools }) => (
        <section key={title} className="tool-group">
          <h2 className="tool-group__title">{title}</h2>
          <div className="tool-group__items">
            {tools.map(({ id, label }) => (
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
