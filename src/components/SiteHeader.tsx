import type { Theme } from '../features/theme/useTheme';
import { HOME_HREF } from '../features/useHashRoute';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface SiteHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function SiteHeader({ theme, onToggleTheme }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__home" href={HOME_HREF} aria-label="Fileo, all tools">
          <Logo />
        </a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
