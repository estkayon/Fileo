import { useCallback, useEffect, useRef, useState } from 'react';
import { toolHref } from '../features/useHashRoute';
import { toolGroups, type ToolCategory } from '../tools';

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<ToolCategory | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const isAnythingOpen = isMenuOpen || openGroup !== null;

  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setOpenGroup(null);
  }, []);

  // While a menu is open, a click outside it, the Escape key or a page change closes it.
  useEffect(() => {
    if (!isAnythingOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeAll();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAll();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', closeAll);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', closeAll);
    };
  }, [isAnythingOpen, closeAll]);

  return (
    <nav ref={navRef} className="nav" aria-label="Tools">
      <button
        type="button"
        className="nav__menu-button"
        aria-label={isMenuOpen ? 'Close tools menu' : 'Open tools menu'}
        aria-expanded={isMenuOpen}
        aria-controls="nav-groups"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d={isMenuOpen ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
        </svg>
      </button>

      <ul id="nav-groups" className={`nav__groups${isMenuOpen ? ' nav__groups--open' : ''}`}>
        {toolGroups.map(({ category, title, tools }) => {
          const isOpen = openGroup === category;
          return (
            <li key={category} className={`nav__group nav__group--${category}`}>
              <button
                type="button"
                className="nav__group-button"
                aria-expanded={isOpen}
                aria-controls={`nav-${category}`}
                onClick={() => setOpenGroup(isOpen ? null : category)}
              >
                {title}
                <svg className="nav__chevron" viewBox="0 0 16 16" width="14" height="14">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              <ul id={`nav-${category}`} className="nav__panel" hidden={!isOpen}>
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <a className="nav__link" href={toolHref(tool.id)} onClick={closeAll}>
                      {tool.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
