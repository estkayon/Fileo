interface ProgressBarProps {
  progress: number;
  completed: number;
  total: number;
}

export function ProgressBar({ progress, completed, total }: ProgressBarProps) {
  const isBatch = total > 1;
  const isDeterminate = isBatch || progress > 0;
  const percent = isDeterminate ? ` ${Math.round(progress * 100)}%` : '';
  const label = isBatch ? `Converting file ${completed + 1} of ${total}...` : 'Converting...';

  return (
    <div className="progress" role="status">
      <span>
        {label}
        {percent}
      </span>
      <progress max={1} value={isDeterminate ? progress : undefined} aria-label={label} />
    </div>
  );
}
