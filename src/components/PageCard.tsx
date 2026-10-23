import type { PageEntry } from '../features/pdf/organize/pageModel';

interface PageCardProps {
  page: PageEntry;
  isFirst: boolean;
  isLast: boolean;
  onMove: (offset: number) => void;
  onRotate: (degrees: number) => void;
  onToggleDeleted: () => void;
}

export function PageCard({
  page,
  isFirst,
  isLast,
  onMove,
  onRotate,
  onToggleDeleted,
}: PageCardProps) {
  const label = `page ${page.sourceIndex + 1}`;
  const isSideways = page.rotation === 90 || page.rotation === 270;

  return (
    <li className={`page-card${page.deleted ? ' page-card--deleted' : ''}`}>
      <div className="page-card__preview">
        {page.thumbnail ? (
          <img
            className={`page-card__image${isSideways ? ' page-card__image--sideways' : ''}`}
            src={page.thumbnail}
            alt={`Preview of ${label}`}
            style={{ transform: `translate(-50%, -50%) rotate(${page.rotation}deg)` }}
          />
        ) : (
          <span className="page-card__placeholder">Loading...</span>
        )}
        {page.deleted && <span className="page-card__badge">Deleted</span>}
      </div>

      <span className="page-card__label">Page {page.sourceIndex + 1}</span>

      <div className="page-card__actions">
        {page.deleted ? (
          <button type="button" className="icon-button" onClick={onToggleDeleted}>
            Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              className="icon-button"
              aria-label={`Move ${label} earlier`}
              disabled={isFirst}
              onClick={() => onMove(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Move ${label} later`}
              disabled={isLast}
              onClick={() => onMove(1)}
            >
              →
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Rotate ${label} left`}
              onClick={() => onRotate(-90)}
            >
              ↺
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Rotate ${label} right`}
              onClick={() => onRotate(90)}
            >
              ↻
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Delete ${label}`}
              onClick={onToggleDeleted}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </li>
  );
}
