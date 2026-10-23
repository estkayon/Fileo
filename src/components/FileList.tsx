import { formatBytes } from '../lib/formatBytes';

interface FileListProps {
  files: File[];
  reorderable: boolean;
  onChange: (files: File[]) => void;
}

export function FileList({ files, reorderable, onChange }: FileListProps) {
  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(files.filter((_, position) => position !== index));

  return (
    <ol className="files">
      {files.map((file, index) => (
        <li key={`${index}-${file.name}`}>
          <span className="files__name">
            {file.name} ({formatBytes(file.size)})
          </span>
          {reorderable && files.length > 1 && (
            <>
              <button
                type="button"
                aria-label={`Move ${file.name} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${file.name} down`}
                disabled={index === files.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
            </>
          )}
          <button type="button" aria-label={`Remove ${file.name}`} onClick={() => remove(index)}>
            ✕
          </button>
        </li>
      ))}
    </ol>
  );
}
