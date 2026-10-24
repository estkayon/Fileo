import { toolHref } from '../features/useHashRoute';
import type { Tool } from '../tools';

export function ToolCard({ id, label, description, category, from, to }: Tool) {
  return (
    <a className={`tool-card tool-card--${category}`} href={toolHref(id)}>
      <span className="tool-card__formats" aria-hidden="true">
        <span className="format">{from}</span>
        {to && (
          <>
            <svg className="tool-card__arrow" viewBox="0 0 16 16" width="14" height="14">
              <path d="M2 8h11m-4-4 4 4-4 4" />
            </svg>
            <span className="format format--to">{to}</span>
          </>
        )}
      </span>
      <span className="tool-card__name">{label}</span>
      <span className="tool-card__description">{description}</span>
    </a>
  );
}
