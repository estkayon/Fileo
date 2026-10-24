import type { Theme } from '../features/theme/useTheme';
import { HOME_HREF } from '../features/useHashRoute';
import { useScrolled } from '../features/useScrolled';
import { Logo } from './Logo';
import { SiteNav } from './SiteNav';
import { ThemeToggle } from './ThemeToggle';

interface SiteHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function SiteHeader({ theme, onToggleTheme }: SiteHeaderProps) {
  const isScrolled = useScrolled();

  return (
    <header className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header__inner">
        <a className="site-header__home" href={HOME_HREF} aria-label="Fileo, all tools">
          <Logo />
        </a>
        <SiteNav />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
